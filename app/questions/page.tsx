import Link from "next/link";
import { Search, HelpCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPublicQuestions } from "@/lib/public-queries";
import { BookmarkButton } from "@/components/bookmark-button";

export const metadata = {
  title: "Interview Questions Bank",
  description: "Search and explore questions asked in actual campus placement interviews.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    topic?: string;
    round?: string;
    difficulty?: string;
  }>;
}

export default async function QuestionsPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const [questions, topics] = await Promise.all([
    getPublicQuestions({
      query: searchParams.q,
      topicSlug: searchParams.topic,
      round: searchParams.round,
      difficulty: searchParams.difficulty,
    }),
    prisma.topic.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 px-3 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <span>Question Repository</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white pt-1">
          Interview Questions
        </h1>
        <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Canonical question bank compiled from verified student placement reports, with real company asked-in timelines.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#111317] border border-stone-200 dark:border-zinc-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <form action="/questions" method="GET" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams.q || ""}
              placeholder="Search question text (e.g. DNS, TCP, indexing, linked list, deadlock)..."
              className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-hidden transition-all shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-600/20"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100 dark:border-zinc-800/80 text-xs">
          <Link
            href="/questions"
            className={`rounded-full px-3.5 py-1.5 font-medium transition-all ${
              !searchParams.topic
                ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25"
                : "border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500"
            }`}
          >
            All Topics
          </Link>
          {topics.map((t) => {
            const isSelected = searchParams.topic === t.slug;
            return (
              <Link
                key={t.id}
                href={`/questions?topic=${t.slug}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ""}`}
                className={`rounded-full px-3.5 py-1.5 font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25"
                    : "border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                {t.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="text-xs font-mono text-slate-500 dark:text-zinc-400 px-1">
        Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{questions.length}</span> questions reported in verified interviews
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#111317] p-8 shadow-xs">
          <HelpCircle className="mx-auto h-8 w-8 text-slate-400 dark:text-zinc-500 mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No questions found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Try searching for broader terms or selecting a different topic.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#121418] overflow-hidden shadow-xs">
          {questions.map((q) => (
            <article
              key={q.id}
              className="p-5 sm:p-6 hover:bg-stone-50/70 dark:hover:bg-zinc-900/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {q.topic && (
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40 px-2.5 py-0.5 rounded-full">
                      {q.topic.name}
                    </span>
                  )}
                  <span className="text-stone-300 dark:text-zinc-700">•</span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize">
                    {q.round.toLowerCase()} Round
                  </span>
                  <span className="text-stone-300 dark:text-zinc-700">•</span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize">
                    {q.difficulty.toLowerCase()}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  <Link
                    href={`/questions/${q.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  >
                    {q.text}
                  </Link>
                </h3>

                {q.companies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Reported at:</span>
                    {q.companies.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/companies/${c.slug}`}
                        className="rounded-full border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/70 px-2.5 py-0.5 text-slate-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500 transition-colors font-medium text-[11px]"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0">
                <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40 px-3 py-1 text-xs font-mono font-semibold text-blue-700 dark:text-blue-400">
                  Asked {q.frequencyCount}x
                </span>
                <div className="flex items-center gap-2">
                  <BookmarkButton
                    targetType="QUESTION"
                    targetId={q.id}
                  />
                  <Link
                    href={`/questions/${q.slug}`}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Timeline</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
