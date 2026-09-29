import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "thepreproom-super-secret-development-key-change-in-production-2026"
);

const SESSION_COOKIE_NAME = "tpr_session";
const SESSION_DURATION_DAYS = 7;

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  authMethod?: "credentials" | "google" | "linkedin" | "totp";
  adminVerified?: boolean;
}

/**
 * Creates an encrypted JWT session cookie
 */
export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DURATION_DAYS,
  });

  return token;
}

/**
 * Clears the session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Decrypts and verifies the current session payload from cookies
 */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (!payload?.userId) return null;

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      name: payload.name as string,
      authMethod: payload.authMethod as SessionPayload["authMethod"],
      adminVerified: Boolean(payload.adminVerified),
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently authenticated user from the database
 */
export async function getCurrentUser() {
  try {
    const session = await getSessionPayload();
    if (!session?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        graduationYear: true,
        bio: true,
        image: true,
        linkedinUrl: true,
        placementStatus: true,
        placedCompany: true,
        oauthProvider: true,
        totpEnabled: true,
        collegeId: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

/**
 * Ensures user is authenticated; throws if not
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required. Please log in.");
  }
  return user;
}

/**
 * Ensures user has verified ADMIN role with TOTP 2FA verification; throws if not
 */
export async function requireAdmin() {
  const session = await getSessionPayload();
  if (!session || session.role !== "ADMIN" || !session.adminVerified) {
    throw new Error("Access denied. Admin 2FA authorization required.");
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Access denied. Admin privileges required.");
  }

  return user;
}

/**
 * Helper to hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Helper to verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
