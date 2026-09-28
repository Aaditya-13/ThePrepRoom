import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpCircle, Building2, Calendar, ArrowRight, Bookmark } from "lucide-react";
import { getPublicQuestionBySlug } from "@/lib/public-queries";
import { BookmarkButton } from "@/components/bookmark-button";
import { ReportModal } from "@/components/report-modal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const question = await getPublicQuestionBySlug(params.slug);

  if (!question) return { title: "Question Not Found" };

  return {
    title: `${question.text} | Interview Question`,
    description: `Placement interview question breakdown. Asked in ${question.totalFrequency} reported campus interviews across ${question.companyBreakdown.length} companies.`,
  };
}

export default async function QuestionDetailPage(props: PageProps) {
  const params = await props.params;
  const question = await getPublicQuestionBySlug(params.slug);

  if (!question) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/questions" className="hover:text-blue-500 transition-colors">
          Questions
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-zinc-200 font-semibold truncate max-w-sm">
          {question.text}
        </span>
      </nav>

      {/* Main Question Card Header */}
      <header className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {question.topic && (
            <Link
              href={`/questions?topic=${question.topic.slug}`}
              className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              {question.topic.name}
            </Link>
          )}
          <span className="text-stone-300 dark:text-zinc-700">•</span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize font-medium">
            {question.round.toLowerCase()} Round
          </span>
          <span className="text-stone-300 dark:text-zinc-700">•</span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize font-medium">
            Difficulty: {question.difficulty.toLowerCase()}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-snug">
          {question.text}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-zinc-800/80">
          <div className="text-xs font-mono text-slate-600 dark:text-zinc-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Asked in {question.totalFrequency}{" "}
              {question.totalFrequency === 1 ? "reported interview" : "reported interviews"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <BookmarkButton
              targetType="QUESTION"
              targetId={question.id}
              showLabel
            />
            <ReportModal
              questionId={question.id}
              targetTitle={question.text}
            />
          </div>
        </div>
      </header>

      {/* Asked In Company Breakdown */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Reported By Companies
        </h2>

        {question.companyBreakdown.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            No specific company frequency aggregated yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {question.companyBreakdown.map((c) => (
              <Link
                key={c.slug}
                href={`/companies/${c.slug}`}
                className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#121418] p-5 hover:border-blue-500/40 hover:-translate-y-1.5 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-blue-950/20 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {c.name}
                  </h4>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-blue-700 dark:text-blue-400">
                    {c.count} {c.count === 1 ? "time" : "times"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Timeline of Interview Appearances */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Reported Interview Timeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Verified instances where candidates reported being asked this question.
          </p>
        </div>

        {question.timeline.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 py-4">No timeline records available.</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#121418] overflow-hidden shadow-xs">
            {question.timeline.map((entry, idx) => (
              <div
                key={idx}
                className="p-5 flex items-center justify-between text-xs sm:text-sm text-slate-800 dark:text-zinc-200"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white">{entry.company}</span>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{entry.role}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40 px-3 py-1 rounded-full font-semibold">
                    Placement Year {entry.year}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Questions in Same Topic */}
      {question.relatedQuestions.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-stone-200 dark:border-zinc-800/80">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Related Questions in {question.topic?.name || "this topic"}
          </h2>
          <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#121418] overflow-hidden shadow-xs">
            {question.relatedQuestions.map((rel) => (
              <Link
                key={rel.id}
                href={`/questions/${rel.slug}`}
                className="flex items-center justify-between p-4 hover:bg-stone-50/70 dark:hover:bg-zinc-900/60 transition-colors text-xs sm:text-sm text-slate-800 dark:text-zinc-200 group"
              >
                <span className="group-hover:text-blue-500 font-medium">
                  {rel.text}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 dark:text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
