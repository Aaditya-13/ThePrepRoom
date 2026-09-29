import { prisma } from "./prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MINUTES = 15;

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
  error?: string;
}

/**
 * Checks whether an admin login attempt is permitted under rate limit policy
 */
export async function checkAdminRateLimit(ip: string, email: string): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - LOCKOUT_WINDOW_MINUTES * 60 * 1000);

  // Check failed attempts by IP and email within the lockout window
  const [failedByIp, failedByEmail] = await Promise.all([
    prisma.adminLoginAttempt.count({
      where: {
        ip,
        success: false,
        createdAt: { gte: windowStart },
      },
    }),
    prisma.adminLoginAttempt.count({
      where: {
        email: email.toLowerCase().trim(),
        success: false,
        createdAt: { gte: windowStart },
      },
    }),
  ]);

  const maxFailed = Math.max(failedByIp, failedByEmail);

  if (maxFailed >= MAX_FAILED_ATTEMPTS) {
    // Find the oldest failed attempt in the current window to compute unlock time
    const oldestInWindow = await prisma.adminLoginAttempt.findFirst({
      where: {
        OR: [
          { ip, success: false },
          { email: email.toLowerCase().trim(), success: false },
        ],
        createdAt: { gte: windowStart },
      },
      orderBy: { createdAt: "asc" },
    });

    const elapsedMs = oldestInWindow ? Date.now() - oldestInWindow.createdAt.getTime() : 0;
    const retryAfterSeconds = Math.max(10, Math.ceil((LOCKOUT_WINDOW_MINUTES * 60 * 1000 - elapsedMs) / 1000));
    const retryMinutes = Math.ceil(retryAfterSeconds / 60);

    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
      error: `Security lockout: Too many failed login attempts. Please wait ${retryMinutes} minute${retryMinutes > 1 ? "s" : ""} before trying again.`,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - maxFailed),
  };
}

/**
 * Records an admin login attempt (success or failure)
 */
export async function recordAdminLoginAttempt(ip: string, email: string, success: boolean): Promise<void> {
  try {
    await prisma.adminLoginAttempt.create({
      data: {
        ip,
        email: email.toLowerCase().trim(),
        success,
      },
    });

    // If successful, purge older failed attempts for this email and IP to reset lockout counter
    if (success) {
      await prisma.adminLoginAttempt.deleteMany({
        where: {
          OR: [{ ip }, { email: email.toLowerCase().trim() }],
          success: false,
        },
      });
    }
  } catch (err) {
    console.error("Failed to record admin login attempt:", err);
  }
}
