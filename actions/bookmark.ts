"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type BookmarkTargetType = "EXPERIENCE" | "QUESTION" | "COMPANY";

export async function toggleBookmarkAction(
  targetType: BookmarkTargetType,
  targetId: string
) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please log in to bookmark items.", isBookmarked: false };
  }

  // 1. Verify that target actually exists in the database
  let targetExists = false;
  if (targetType === "EXPERIENCE") {
    const exp = await prisma.experience.findUnique({ where: { id: targetId } });
    targetExists = !!exp;
  } else if (targetType === "QUESTION") {
    const q = await prisma.question.findUnique({ where: { id: targetId } });
    targetExists = !!q;
  } else if (targetType === "COMPANY") {
    const c = await prisma.company.findUnique({ where: { id: targetId } });
    targetExists = !!c;
  }

  if (!targetExists) {
    return { error: `Target ${targetType} does not exist.`, isBookmarked: false };
  }

  // 2. Check if already bookmarked
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: user.id,
        targetType,
        targetId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { id: existing.id },
    });
    revalidatePath("/bookmarks");
    return { success: true, isBookmarked: false };
  } else {
    await prisma.bookmark.create({
      data: {
        userId: user.id,
        targetType,
        targetId,
      },
    });
    revalidatePath("/bookmarks");
    return { success: true, isBookmarked: true };
  }
}

export async function checkBookmarkStatus(
  targetType: BookmarkTargetType,
  targetId: string
) {
  const user = await getCurrentUser();
  if (!user) return false;

  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: user.id,
        targetType,
        targetId,
      },
    },
  });

  return !!bookmark;
}
