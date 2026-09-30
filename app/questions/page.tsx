import Link from "next/link";
import { Search, HelpCircle, ArrowRight } from "lucide-react";
import { getPublicQuestions, getAllTopics } from "@/lib/public-queries";
import { BookmarkButton } from "@/components/bookmark-button";

export const revalidate = 30;

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
    getAllTopics(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-[-0.03em] text-white">
          Interview Questions
        </h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111317] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <form action="/questions" method="GET" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              name="q"
              defaultValue={searchParams.q || ""}
              placeholder="Search question text (e.g. DNS, TCP, indexing, linked list, deadlock)..."
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/70 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-blue-400 focus:outline-none transition-all shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-600/20 outline-none"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800/80 text-xs">
          <Link
            href="/questions"
            className={`rounded-full px-3.5 py-1.5 font-medium transition-all ${
              !searchParams.topic
                ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/25"
                : "border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-blue-500 hover:text-blue-500"
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
                    : "border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                {t.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="text-xs font-mono text-zinc-400 px-1">
        Showing <span className="font-semibold text-zinc-200">{questions.length}</span> questions reported in verified interviews
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-[#111317] p-8 sm:p-12 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-sm shadow-blue-500/10">
            <HelpCircle className="h-6 w-6" />
          </div>
          {searchParams.q || searchParams.topic || searchParams.round || searchParams.difficulty ? (
            <>
              <h3 className="text-base sm:text-lg font-bold text-white">No matching questions found</h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md mx-auto">
                No questions matched your current filters. Try searching for broader terms or resetting your search.
              </p>
              <div className="mt-5">
                <Link
                  href="/questions"
                  className="rounded-full border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 px-5 py-2 text-xs sm:text-sm font-semibold text-zinc-200 transition-all inline-block"
                >
                  Clear All Filters
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-base sm:text-lg font-bold text-white">No Interview Questions Yet</h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-md mx-auto">
                Questions are automatically indexed in real-time as students and alumni share their verified interview experiences.
              </p>
              <div className="mt-5">
                <Link
                  href="/share"
                  className="rounded-full bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                >
                  <span>Share an Interview Experience</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/80 border border-zinc-800/80 rounded-2xl bg-[#121418] overflow-hidden shadow-xs">
          {questions.map((q) => (
            <article
              key={q.id}
              className="p-5 sm:p-6 hover:bg-zinc-900/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {q.topic && (
                    <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-0.5 rounded-full">
                      {q.topic.name}
                    </span>
                  )}
                  <span className="text-zinc-700">•</span>
                  <span className="text-xs text-zinc-400 capitalize">
                    {q.round.toLowerCase()} Round
                  </span>
                  <span className="text-zinc-700">•</span>
                  <span className="text-xs text-zinc-400 capitalize">
                    {q.difficulty.toLowerCase()}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  <Link
                    href={`/questions/${q.slug}`}
                    className="hover:text-blue-400 group-hover:text-blue-400 transition-colors"
                  >
                    {q.text}
                  </Link>
                </h3>

                {q.companies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-300">Reported at:</span>
                    {q.companies.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/companies/${c.slug}`}
                        className="rounded-full border border-zinc-700 bg-zinc-800/70 px-2.5 py-0.5 text-zinc-300 hover:border-blue-500 hover:text-blue-400 transition-colors font-medium text-[11px]"
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
