"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { verifyCompanyRoleConsistency } from "@/lib/company-role";
import { findOrCreateCanonicalQuestion } from "@/lib/deduplicate";
import { slugify } from "@/lib/utils";
import { getPublicExperiences } from "@/lib/public-queries";

export interface QuestionEntry {
  text: string;
  topicId?: string;
  difficulty?: string;
  round?: string;
  notes?: string;
}

export interface RoundEntry {
  roundType: string;
  orderIndex: number;
  roundName: string;
  platform?: string;
  durationMinutes?: number;
  sections?: string;
  difficulty?: string;
  description?: string;
  questions?: QuestionEntry[];
}

export interface ExperienceSubmissionData {
  id?: string; // If editing an existing draft
  companyId: string;
  roleId: string;
  interviewYear: number;
  graduationYear?: number;
  department?: string;
  placementType: string;
  result: string;
  overallExperience: string;
  advice?: string;
  isAnonymous: boolean;
  rounds: RoundEntry[];
}

/**
 * Helper to pre-resolve all canonical questions before entering a transaction
 * to eliminate transaction timeouts and SQLite lock contention.
 */
async function preResolveRoundsAndQuestions(rounds: RoundEntry[]) {
  const resolved: {
    round: RoundEntry;
    questionLinks: { questionId: string; notes: string | null }[];
  }[] = [];

  if (!rounds || rounds.length === 0) return resolved;

  for (const r of rounds) {
    const links: { questionId: string; notes: string | null }[] = [];
    if (r.questions && r.questions.length > 0) {
      for (const q of r.questions) {
        if (q.text && q.text.trim()) {
          const canonical = await findOrCreateCanonicalQuestion({
            text: q.text,
            topicId: q.topicId || null,
            round: r.roundType,
            difficulty: q.difficulty || "MEDIUM",
          });
          links.push({
            questionId: canonical.id,
            notes: q.notes?.trim() || null,
          });
        }
      }
    }
    resolved.push({ round: r, questionLinks: links });
  }

  return resolved;
}

/**
 * Saves or updates an Experience as a DRAFT.
 * Drafts are strictly private and never appear in public views or stats.
 */
export async function saveExperienceDraftAction(data: ExperienceSubmissionData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to save a draft." };
  }

  // If both companyId and roleId are provided, verify consistency
  if (data.companyId && data.roleId) {
    const check = await verifyCompanyRoleConsistency(data.companyId, data.roleId);
    if (!check.valid) {
      return { error: check.error };
    }
  }

  const college = await prisma.college.findFirst();

  let slug = "";
  if (data.id) {
    const existing = await prisma.experience.findUnique({ where: { id: data.id } });
    if (!existing || existing.userId !== user.id) {
      return { error: "Draft not found or unauthorized." };
    }
    slug = existing.slug;
  } else {
    const company = await prisma.company.findUnique({ where: { id: data.companyId } });
    const role = await prisma.companyRole.findUnique({ where: { id: data.roleId } });
    const baseSlug = slugify(
      `${company?.name || "company"}-${role?.title || "role"}-${data.interviewYear || new Date().getFullYear()}-draft-${Date.now().toString().slice(-4)}`
    );
    slug = baseSlug;
  }

  // Pre-resolve canonical questions outside the transaction
  const resolvedRounds = await preResolveRoundsAndQuestions(data.rounds);

  // Create or update experience in DRAFT status
  const experience = await prisma.$transaction(
    async (tx) => {
      let exp;
      if (data.id) {
        // Clear old rounds to recreate
        await tx.experienceQuestion.deleteMany({ where: { experienceId: data.id } });
        await tx.interviewRound.deleteMany({ where: { experienceId: data.id } });

        exp = await tx.experience.update({
          where: { id: data.id },
          data: {
            companyId: data.companyId,
            roleId: data.roleId,
            interviewYear: data.interviewYear,
            graduationYear: data.graduationYear || null,
            department: data.department || null,
            placementType: data.placementType || "CAMPUS",
            result: data.result || "PENDING",
            overallExperience: data.overallExperience || "",
            advice: data.advice || "",
            isAnonymous: data.isAnonymous ?? false,
            status: "DRAFT",
          },
        });
      } else {
        exp = await tx.experience.create({
          data: {
            slug,
            userId: user.id,
            collegeId: college?.id || null,
            companyId: data.companyId,
            roleId: data.roleId,
            interviewYear: data.interviewYear,
            graduationYear: data.graduationYear || null,
            department: data.department || null,
            placementType: data.placementType || "CAMPUS",
            result: data.result || "PENDING",
            overallExperience: data.overallExperience || "",
            advice: data.advice || "",
            isAnonymous: data.isAnonymous ?? false,
            status: "DRAFT",
          },
        });
      }

      // Fast batch insert of rounds and questions
      for (const item of resolvedRounds) {
        const round = await tx.interviewRound.create({
          data: {
            experienceId: exp.id,
            roundType: item.round.roundType,
            orderIndex: item.round.orderIndex,
            roundName: item.round.roundName,
            platform: item.round.platform || null,
            durationMinutes: item.round.durationMinutes || null,
            sections: item.round.sections || null,
            difficulty: item.round.difficulty || null,
            description: item.round.description || null,
          },
        });

        if (item.questionLinks.length > 0) {
          await tx.experienceQuestion.createMany({
            data: item.questionLinks.map((ql) => ({
              experienceId: exp.id,
              interviewRoundId: round.id,
              questionId: ql.questionId,
              studentNotes: ql.notes,
            })),
          });
        }
      }

      return exp;
    },
    { timeout: 15000, maxWait: 5000 }
  );

  revalidatePath("/profile");
  return { success: true, experienceId: experience.id, slug: experience.slug };
}

/**
 * Submits an Experience for review (Sets status to PENDING).
 * Validates company-role consistency, normalizes & deduplicates questions, and assigns rounds.
 */
export async function submitExperienceAction(data: ExperienceSubmissionData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to submit an experience." };
  }

  // 1. Mandatory server-side validation
  if (!data.companyId) return { error: "Company is required." };
  if (!data.roleId) return { error: "Role is required." };
  if (!data.interviewYear) return { error: "Interview year is required." };
  if (!data.overallExperience || data.overallExperience.trim().length < 20) {
    return { error: "Please provide a descriptive overall interview experience (at least 20 characters)." };
  }

  // 2. Strict Company-Role consistency enforcement
  const check = await verifyCompanyRoleConsistency(data.companyId, data.roleId);
  if (!check.valid) {
    return { error: check.error };
  }

  const college = await prisma.college.findFirst();

  // Generate unique slug
  const company = await prisma.company.findUnique({ where: { id: data.companyId } });
  const role = await prisma.companyRole.findUnique({ where: { id: data.roleId } });
  const baseSlug = slugify(`${company?.name || "company"}-${role?.title || "role"}-${data.interviewYear}`);

  let uniqueSlug = baseSlug;
  let counter = 1;
  while (await prisma.experience.findFirst({ where: { slug: uniqueSlug, id: { not: data.id || "" } } })) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Pre-resolve canonical questions outside the transaction to eliminate transaction timeouts
  const resolvedRounds = await preResolveRoundsAndQuestions(data.rounds);

  // Execute database transaction with 15s timeout
  const submitted = await prisma.$transaction(
    async (tx) => {
      let exp;

      if (data.id) {
        // Clear old rounds if updating from draft
        await tx.experienceQuestion.deleteMany({ where: { experienceId: data.id } });
        await tx.interviewRound.deleteMany({ where: { experienceId: data.id } });

        exp = await tx.experience.update({
          where: { id: data.id },
          data: {
            slug: uniqueSlug,
            companyId: data.companyId,
            roleId: data.roleId,
            interviewYear: Number(data.interviewYear),
            graduationYear: data.graduationYear ? Number(data.graduationYear) : null,
            department: data.department?.trim() || null,
            placementType: data.placementType || "CAMPUS",
            result: data.result || "PENDING",
            overallExperience: data.overallExperience.trim(),
            advice: data.advice?.trim() || null,
            isAnonymous: !!data.isAnonymous,
            status: "PENDING", // Ready for moderation review
          },
        });
      } else {
        exp = await tx.experience.create({
          data: {
            slug: uniqueSlug,
            userId: user.id,
            collegeId: college?.id || null,
            companyId: data.companyId,
            roleId: data.roleId,
            interviewYear: Number(data.interviewYear),
            graduationYear: data.graduationYear ? Number(data.graduationYear) : null,
            department: data.department?.trim() || null,
            placementType: data.placementType || "CAMPUS",
            result: data.result || "PENDING",
            overallExperience: data.overallExperience.trim(),
            advice: data.advice?.trim() || null,
            isAnonymous: !!data.isAnonymous,
            status: "PENDING", // Ready for moderation review
          },
        });
      }

      // Fast batch insert of rounds and questions
      for (const item of resolvedRounds) {
        const round = await tx.interviewRound.create({
          data: {
            experienceId: exp.id,
            roundType: item.round.roundType,
            orderIndex: item.round.orderIndex,
            roundName: item.round.roundName,
            platform: item.round.platform?.trim() || null,
            durationMinutes: item.round.durationMinutes ? Number(item.round.durationMinutes) : null,
            sections: item.round.sections?.trim() || null,
            difficulty: item.round.difficulty || null,
            description: item.round.description?.trim() || null,
          },
        });

        if (item.questionLinks.length > 0) {
          await tx.experienceQuestion.createMany({
            data: item.questionLinks.map((ql) => ({
              experienceId: exp.id,
              interviewRoundId: round.id,
              questionId: ql.questionId,
              studentNotes: ql.notes,
            })),
          });
        }
      }

      return exp;
    },
    { timeout: 15000, maxWait: 5000 }
  );

  revalidatePath("/profile");
  revalidatePath("/admin");
  revalidatePath("/experiences");
  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath("/questions");
  return { success: true, slug: submitted.slug, experienceId: submitted.id };
}

/**
 * ADMIN ONLY: Moderate experience (Approve, Reject, Feature, Delete)
 */
export async function adminModerateExperienceAction(
  id: string,
  action: "APPROVE" | "REJECT" | "FEATURE" | "DELETE"
) {
  await requireAdmin();

  if (action === "DELETE") {
    await prisma.experience.delete({ where: { id } });
  } else if (action === "APPROVE") {
    await prisma.experience.update({
      where: { id },
      data: { status: "APPROVED" },
    });
  } else if (action === "REJECT") {
    await prisma.experience.update({
      where: { id },
      data: { status: "REJECTED" },
    });
  } else if (action === "FEATURE") {
    const exp = await prisma.experience.findUnique({ where: { id } });
    if (exp) {
      await prisma.experience.update({
        where: { id },
        data: { isFeatured: !exp.isFeatured },
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/experiences");
  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath("/questions");
  return { success: true };
}

/**
 * Public action: Load more experiences for incremental pagination
 */
export async function loadMoreExperiencesAction(params: {
  query?: string;
  companySlug?: string;
  roleSlug?: string;
  interviewYear?: number;
  placementType?: string;
  roundType?: string;
  result?: string;
  sortBy?: "newest" | "views";
  page: number;
  limit?: number;
}) {
  const result = await getPublicExperiences({
    query: params.query,
    companySlug: params.companySlug,
    roleSlug: params.roleSlug,
    interviewYear: params.interviewYear,
    placementType: params.placementType,
    roundType: params.roundType,
    result: params.result,
    sortBy: params.sortBy || "newest",
    page: params.page,
    limit: params.limit || 6,
  });

  return {
    experiences: result.experiences.map((exp) => ({
      id: exp.id,
      slug: exp.slug,
      status: exp.status,
      viewsCount: exp.viewsCount,
      company: {
        name: exp.company.name,
        slug: exp.company.slug,
      },
      role: {
        title: exp.role.title,
        slug: exp.role.slug,
      },
      interviewYear: exp.interviewYear,
      placementType: exp.placementType,
      result: exp.result,
      overallExperience: exp.overallExperience,
      isDemo: exp.isDemo,
      rounds: exp.rounds.map((r) => ({
        roundType: r.roundType,
        roundName: r.roundName || undefined,
      })),
    })),
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
  };
}
