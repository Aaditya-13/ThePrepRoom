"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createSessionCookie,
  clearSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import {
  generateTotpSetup,
  verifyTotpToken,
  verifyAndConsumeRecoveryCode,
} from "@/lib/totp";
import {
  checkAdminRateLimit,
  recordAdminLoginAttempt,
} from "@/lib/rate-limit";

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headerList.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export type AdminAuthStep = "CREDENTIALS" | "SETUP_TOTP" | "VERIFY_TOTP";

export interface AdminAuthResponse {
  success?: boolean;
  error?: string;
  step?: AdminAuthStep;
  email?: string;
  qrCodeDataUrl?: string;
  secret?: string;
  recoveryCodes?: string[];
  remainingAttempts?: number;
}

/**
 * Step 1: Validates admin email & password under rate limiting
 */
export async function adminVerifyCredentialsAction(
  prevState: any,
  formData: FormData
): Promise<AdminAuthResponse> {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const ip = await getClientIp();

  if (!email || !password) {
    return { error: "Please enter your administrator email and password." };
  }

  // Enforce IP and Email rate limiting
  const rateLimit = await checkAdminRateLimit(ip, email);
  if (!rateLimit.allowed) {
    return { error: rateLimit.error };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Strictly check that user exists, has a password, and holds the ADMIN role
  // If not an admin, reject identically to prevent email enumeration
  if (!user || user.role !== "ADMIN" || !user.passwordHash) {
    await recordAdminLoginAttempt(ip, email, false);
    const updatedLimit = await checkAdminRateLimit(ip, email);
    return {
      error: "Invalid administrator credentials or unauthorized account.",
      remainingAttempts: updatedLimit.remainingAttempts,
    };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    await recordAdminLoginAttempt(ip, email, false);
    const updatedLimit = await checkAdminRateLimit(ip, email);
    return {
      error: "Invalid administrator credentials.",
      remainingAttempts: updatedLimit.remainingAttempts,
    };
  }

  // If user hasn't set up 2FA yet, initiate TOTP provisioning
  if (!user.totpEnabled || !user.totpSecret) {
    const setup = await generateTotpSetup(user.email);

    // Temporarily save secret & recovery codes pending confirmation
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totpSecret: setup.secret,
        totpRecoveryCodes: setup.hashedRecoveryCodes,
        totpEnabled: false,
      },
    });

    return {
      step: "SETUP_TOTP",
      email: user.email,
      qrCodeDataUrl: setup.qrCodeDataUrl,
      secret: setup.secret,
      recoveryCodes: setup.recoveryCodes,
    };
  }

  // Admin already has 2FA enabled -> proceed to TOTP verification step
  return {
    step: "VERIFY_TOTP",
    email: user.email,
  };
}

/**
 * Step 2A: Confirms initial TOTP 2FA setup by verifying first 6-digit code
 */
export async function adminConfirmTotpSetupAction(
  email: string,
  token: string
): Promise<AdminAuthResponse> {
  const ip = await getClientIp();
  const normalizedEmail = email.toLowerCase().trim();

  const rateLimit = await checkAdminRateLimit(ip, normalizedEmail);
  if (!rateLimit.allowed) {
    return { error: rateLimit.error };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || user.role !== "ADMIN" || !user.totpSecret) {
    return { error: "Admin session expired. Please sign in again." };
  }

  const isValid = verifyTotpToken(token, user.totpSecret);
  if (!isValid) {
    await recordAdminLoginAttempt(ip, normalizedEmail, false);
    const updatedLimit = await checkAdminRateLimit(ip, normalizedEmail);
    return {
      error: "Invalid 6-digit verification code. Please check your authenticator app.",
      remainingAttempts: updatedLimit.remainingAttempts,
    };
  }

  // 2FA is officially verified and enabled
  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: true },
  });

  await recordAdminLoginAttempt(ip, normalizedEmail, true);

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    role: "ADMIN",
    name: user.name,
    authMethod: "totp",
    adminVerified: true,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Step 2B: Verifies 6-digit TOTP code (or single-use backup recovery code)
 */
export async function adminVerifyTotpAction(
  email: string,
  code: string,
  isRecoveryCode = false
): Promise<AdminAuthResponse> {
  const ip = await getClientIp();
  const normalizedEmail = email.toLowerCase().trim();

  const rateLimit = await checkAdminRateLimit(ip, normalizedEmail);
  if (!rateLimit.allowed) {
    return { error: rateLimit.error };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || user.role !== "ADMIN" || !user.totpEnabled || !user.totpSecret) {
    return { error: "Admin session expired or 2FA not configured. Please sign in again." };
  }

  if (isRecoveryCode) {
    // Verify backup recovery code
    const recoveryResult = verifyAndConsumeRecoveryCode(code, user.totpRecoveryCodes);
    if (!recoveryResult.valid) {
      await recordAdminLoginAttempt(ip, normalizedEmail, false);
      const updatedLimit = await checkAdminRateLimit(ip, normalizedEmail);
      return {
        error: "Invalid backup recovery code. Codes are single-use only.",
        remainingAttempts: updatedLimit.remainingAttempts,
      };
    }

    // Update remaining recovery codes
    await prisma.user.update({
      where: { id: user.id },
      data: { totpRecoveryCodes: recoveryResult.updatedHashedCodesJson },
    });
  } else {
    // Verify 6-digit TOTP token
    const isTotpValid = verifyTotpToken(code, user.totpSecret);
    if (!isTotpValid) {
      await recordAdminLoginAttempt(ip, normalizedEmail, false);
      const updatedLimit = await checkAdminRateLimit(ip, normalizedEmail);
      return {
        error: "Invalid 6-digit verification code. Please try the current code from your authenticator app.",
        remainingAttempts: updatedLimit.remainingAttempts,
      };
    }
  }

  // Clear rate limits upon successful login
  await recordAdminLoginAttempt(ip, normalizedEmail, true);

  await createSessionCookie({
    userId: user.id,
    email: user.email,
    role: "ADMIN",
    name: user.name,
    authMethod: "totp",
    adminVerified: true,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Admin Logout
 */
export async function adminLogoutAction() {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  return { success: true };
}
