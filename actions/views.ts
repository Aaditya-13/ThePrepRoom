"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export type ViewTargetType = "EXPERIENCE" | "COMPANY";

/**
 * Records a unique visitor view for an experience or company.
 * - Prevents duplicate increments from refreshes, repeated requests, and back/forward navigation.
 * - Enforces both client 24h window and server-side cookie deduplication.
 * - Atomically increments the item's database-backed viewsCount column.
 */
export async function recordUniqueViewAction(
  targetType: ViewTargetType,
  targetId: string
): Promise<{ success: boolean; viewsCount?: number; alreadyViewed?: boolean }> {
  if (!targetId) return { success: false };

  const cookieStore = await cookies();
  const cookieName = `tpr_v_${targetType.toLowerCase()}_${targetId}`;
  const existingCookie = cookieStore.get(cookieName);

  // If cookie exists, this visitor already viewed this item in this window
  if (existingCookie) {
    return { success: true, alreadyViewed: true };
  }

  try {
    let updatedViewsCount: number | undefined;

    if (targetType === "EXPERIENCE") {
      const updated = await prisma.experience.update({
        where: { id: targetId },
        data: { viewsCount: { increment: 1 } },
        select: { viewsCount: true },
      });
      updatedViewsCount = updated.viewsCount;
    } else if (targetType === "COMPANY") {
      const updated = await prisma.company.update({
        where: { id: targetId },
        data: { viewsCount: { increment: 1 } },
        select: { viewsCount: true },
      });
      updatedViewsCount = updated.viewsCount;
    }

    // Set cookie for 24 hours to prevent duplicate increments from refreshes
    cookieStore.set(cookieName, "1", {
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    return { success: true, viewsCount: updatedViewsCount, alreadyViewed: false };
  } catch (error) {
    console.error("Failed to record unique view:", error);
    return { success: false };
  }
}
