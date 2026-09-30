import { prisma } from "./prisma";
import { slugify } from "./utils";

/**
 * Deterministically normalizes a question text for canonical deduplication.
 * Example:
 * "What is DNS?" -> "what is dns"
 * "What is DNS ?" -> "what is dns"
 * "  Explain TCP vs UDP. " -> "explain tcp vs udp"
 */
export function normalizeQuestionText(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .trim()
    // Replace multiple spaces/newlines/tabs with single space
    .replace(/\s+/g, " ")
    // Remove trailing question marks, periods, commas, exclamation marks
    .replace(/[?!.,;:—–-]+$/g, "")
    .trim();
}

export interface QuestionInput {
  text: string;
  topicId?: string | null;
  round?: string;
  difficulty?: string;
}

/**
 * Deterministically finds an existing canonical Question by normalizedText
 * or creates a new Question record. Accepts an optional database client (such as tx).
 */
export async function findOrCreateCanonicalQuestion(
  input: QuestionInput,
  db: any = prisma
) {
  const trimmedText = input.text.trim();
  const normalized = normalizeQuestionText(trimmedText);

  if (!normalized) {
    throw new Error("Question text cannot be empty");
  }

  // 1. Try to find existing question by normalizedText
  const existing = await db.question.findUnique({
    where: { normalizedText: normalized },
  });

  if (existing) {
    // If topic wasn't assigned previously and is provided now, backfill topic
    if (!existing.topicId && input.topicId) {
      return await db.question.update({
        where: { id: existing.id },
        data: { topicId: input.topicId },
      });
    }
    return existing;
  }

  // 2. Generate a clean, unique slug with at most 1 fast check
  let baseSlug = slugify(trimmedText.slice(0, 80));
  if (!baseSlug) {
    baseSlug = `q-${Date.now()}`;
  }

  let uniqueSlug = baseSlug;
  const slugExists = await db.question.findUnique({
    where: { slug: uniqueSlug },
    select: { id: true },
  });
  if (slugExists) {
    uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  // 3. Create canonical question record
  return await db.question.create({
    data: {
      text: trimmedText,
      normalizedText: normalized,
      slug: uniqueSlug,
      round: input.round || "TECHNICAL",
      difficulty: input.difficulty || "MEDIUM",
      topicId: input.topicId || null,
    },
  });
}
