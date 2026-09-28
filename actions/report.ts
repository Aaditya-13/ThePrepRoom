"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth";

export interface ReportInput {
  experienceId?: string;
  questionId?: string;
  reason: string;
  details?: string;
}

export async function submitReportAction(input: ReportInput) {
  const { experienceId, questionId, reason, details } = input;

  if (!experienceId && !questionId) {
    return { error: "A report must target either an experience or a question." };
  }

  if (experienceId && questionId) {
    return { error: "A report cannot target both an experience and a question simultaneously." };
  }

  if (!reason || !reason.trim()) {
    return { error: "Please select a reason for reporting." };
  }

  // Validate target existence
  if (experienceId) {
    const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
    if (!exp) return { error: "The reported experience was not found." };
  }

  if (questionId) {
    const q = await prisma.question.findUnique({ where: { id: questionId } });
    if (!q) return { error: "The reported question was not found." };
  }

  const currentUser = await getCurrentUser();

  await prisma.report.create({
    data: {
      experienceId: experienceId || null,
      questionId: questionId || null,
      reporterId: currentUser?.id || null,
      reason: reason.trim(),
      details: details?.trim() || null,
      status: "PENDING",
    },
  });

  return { success: true };
}

export async function updateReportStatusAction(reportId: string, status: "RESOLVED" | "DISMISSED") {
  await requireAdmin();

  await prisma.report.update({
    where: { id: reportId },
    data: { status },
  });

  revalidatePath("/admin");
  return { success: true };
}
