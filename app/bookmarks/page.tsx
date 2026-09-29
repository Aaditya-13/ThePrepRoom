import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Building2, FileText, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookmarkButton } from "@/components/bookmark-button";

export const metadata = {
  title: "Saved Bookmarks",
};

export default async function BookmarksPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/bookmarks");
  }

  const rawBookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Resolve target objects
  const experienceIds = rawBookmarks.filter((b) => b.targetType === "EXPERIENCE").map((b) => b.targetId);
  const questionIds = rawBookmarks.filter((b) => b.targetType === "QUESTION").map((b) => b.targetId);
  const companyIds = rawBookmarks.filter((b) => b.targetType === "COMPANY").map((b) => b.targetId);

  const [experiences, questions, companies] = await Promise.all([
    experienceIds.length > 0
      ? prisma.experience.findMany({
          where: { id: { in: experienceIds } },
          include: { company: true, role: true },
        })
      : [],
    questionIds.length > 0
      ? prisma.question.findMany({
          where: { id: { in: questionIds } },
          include: { topic: true },
        })
      : [],
    companyIds.length > 0
      ? prisma.company.findMany({
          where: { id: { in: companyIds } },
        })
      : [],
  ]);

  const hasAny = experiences.length > 0 || questions.length > 0 || companies.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Saved Bookmarks
        </h1>
      </div>

      {!hasAny ? (
        <div className="text-center py-20 border border-dashed border-stone-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-[#111317] p-8 space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500">
            <Bookmark className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">No bookmarks saved yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Click the bookmark icon on any experience, question, or company to save it here for fast revision.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/experiences"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all"
            >
              Explore Experiences
            </Link>
            <Link
              href="/questions"
              className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:border-blue-500/50 hover:text-blue-500 transition-all shadow-xs"
            >
              Browse Questions
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Experiences Bookmarks */}
          {experiences.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-3">
                <FileText className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Experiences ({experiences.length})
                </h2>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#111317] overflow-hidden shadow-xs">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-[#16181e] transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-base">
                        {exp.company.name} — {exp.role.title}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        Placement Year {exp.interviewYear} · {exp.result}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <BookmarkButton
                        targetType="EXPERIENCE"
                        targetId={exp.id}
                        initialBookmarked={true}
                      />
                      <Link
                        href={`/experiences/${exp.slug}`}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Questions Bookmarks */}
          {questions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-3">
                <HelpCircle className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Questions ({questions.length})
                </h2>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#111317] overflow-hidden shadow-xs">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-[#16181e] transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-base">
                        {q.text}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {q.topic?.name || "General"} · {q.round} Round
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <BookmarkButton
                        targetType="QUESTION"
                        targetId={q.id}
                        initialBookmarked={true}
                      />
                      <Link
                        href={`/questions/${q.slug}`}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Companies Bookmarks */}
          {companies.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-3">
                <Building2 className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Companies ({companies.length})
                </h2>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#111317] overflow-hidden shadow-xs">
                {companies.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-[#16181e] transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-base">
                        {c.name}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{c.industry || "Technology & Consulting"}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <BookmarkButton
                        targetType="COMPANY"
                        targetId={c.id}
                        initialBookmarked={true}
                      />
                      <Link
                        href={`/companies/${c.slug}`}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
