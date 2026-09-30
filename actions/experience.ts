"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { verifyCompanyRoleConsistency } from "@/lib/company-role";
import { findOrCreateCanonicalQuestion, normalizeQuestionText } from "@/lib/deduplicate";
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
  if (!rounds || rounds.length === 0) return [];

  // 1. Gather all unique non-empty questions across rounds
  const questionMap = new Map<string, QuestionEntry & { roundType: string }>();
  for (const r of rounds) {
    if (r.questions) {
      for (const q of r.questions) {
        if (q.text && q.text.trim()) {
          const norm = normalizeQuestionText(q.text);
          if (!questionMap.has(norm)) {
            questionMap.set(norm, { ...q, roundType: r.roundType });
          }
        }
      }
    }
  }

  // 2. Batch lookup all normalized questions in ONE single roundtrip
  const allNormalized = Array.from(questionMap.keys());
  const existingQuestions =
    allNormalized.length > 0
      ? await prisma.question.findMany({
          where: { normalizedText: { in: allNormalized } },
        })
      : [];

  const existingMap = new Map(existingQuestions.map((q) => [q.normalizedText, q]));

  // 3. Concurrently create only missing questions in parallel
  const missing = allNormalized.filter((norm) => !existingMap.has(norm));
  if (missing.length > 0) {
    await Promise.all(
      missing.map(async (norm) => {
        const qData = questionMap.get(norm)!;
        const created = await findOrCreateCanonicalQuestion({
          text: qData.text,
          topicId: qData.topicId || null,
          round: qData.roundType,
          difficulty: qData.difficulty || "MEDIUM",
        });
        existingMap.set(norm, created);
      })
    );
  }

  // 4. Assemble question links synchronously (0 extra DB queries!)
  return rounds.map((r) => {
    const links: { questionId: string; notes: string | null }[] = [];
    if (r.questions) {
      for (const q of r.questions) {
        if (q.text && q.text.trim()) {
          const norm = normalizeQuestionText(q.text);
          const canonical = existingMap.get(norm);
          if (canonical) {
            links.push({
              questionId: canonical.id,
              notes: q.notes?.trim() || null,
            });
          }
        }
      }
    }
    return { round: r, questionLinks: links };
  });
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

      // Fast parallel insert of rounds and questions
      await Promise.all(
        resolvedRounds.map(async (item) => {
          const round = await tx.interviewRound.create({
            data: {
              experienceId: exp.id,
              roundType: item.round.roundType,
              orderIndex: item.round.orderIndex,
              roundName: item.round.roundName,
              platform: item.round.platform || null,
              durationMinutes: item.round.durationMinutes ? Number(item.round.durationMinutes) : null,
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
        })
      );

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

  // Concurrently fetch company, role, and college in ONE parallel roundtrip
  const [company, role, college] = await Promise.all([
    prisma.company.findUnique({ where: { id: data.companyId }, select: { name: true } }),
    prisma.companyRole.findUnique({ where: { id: data.roleId }, select: { title: true } }),
    prisma.college.findFirst({ select: { id: true } }),
  ]);

  // Fast single slug check
  const baseSlug = slugify(`${company?.name || "company"}-${role?.title || "role"}-${data.interviewYear}`);
  let uniqueSlug = baseSlug;
  const existingSlug = await prisma.experience.findFirst({
    where: { slug: uniqueSlug, id: { not: data.id || "" } },
    select: { id: true },
  });
  if (existingSlug) {
    uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  }

  // Pre-resolve canonical questions concurrently
  const resolvedRounds = await preResolveRoundsAndQuestions(data.rounds);

  // Execute database transaction with parallel round insertion
  const submitted = await prisma.$transaction(
    async (tx) => {
      let exp;

      if (data.id) {
        // Concurrently clear old rounds if updating from draft
        await Promise.all([
          tx.experienceQuestion.deleteMany({ where: { experienceId: data.id } }),
          tx.interviewRound.deleteMany({ where: { experienceId: data.id } }),
        ]);

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

      // Concurrently insert all rounds and question links in parallel
      await Promise.all(
        resolvedRounds.map(async (item) => {
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
        })
      );

      return exp;
    },
    { timeout: 15000, maxWait: 5000 }
  );

  revalidatePath("/profile");
  revalidatePath("/experiences");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath("/questions");

  return { success: true, slug: submitted.slug, experienceId: submitted.id };
}

/**
 * Allows the author (or an admin) to delete their experience or draft.
 * Cascades related interview rounds, questions, reports, and bookmarks.
 */
export async function deleteUserExperienceAction(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "You must be signed in to delete an experience." };
  }

  const existing = await prisma.experience.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true, slug: true },
  });

  if (!existing) {
    return { error: "Experience not found." };
  }

  if (existing.userId !== user.id && user.role !== "ADMIN") {
    return { error: "You are not authorized to delete this experience." };
  }

  // Delete bookmarks pointing to this experience
  await prisma.bookmark.deleteMany({
    where: { targetType: "EXPERIENCE", targetId: id },
  });

  // Delete the experience (cascades rounds, questions, reports)
  await prisma.experience.delete({
    where: { id },
  });

  revalidatePath("/profile");
  revalidatePath("/experiences");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/companies");
  revalidatePath("/questions");

  return { success: true };
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
