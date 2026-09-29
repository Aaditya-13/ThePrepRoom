import Link from "next/link";
import { Search, Building2, HelpCircle, FileText, ArrowRight, Sparkles } from "lucide-react";
import { globalSearch } from "@/lib/public-queries";
import { ExperienceRow } from "@/components/experience-row";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata = {
  title: "Search ThePrepRoom",
  description: "Search placement experiences, companies, technical questions, and interview topics.",
};

const POPULAR_SEARCHES = ["TCS", "Infosys", "Linux", "SQL", "DBMS", "Amazon", "Operating Systems"];

export default async function SearchPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  const results = query ? await globalSearch(query) : { experiences: [], companies: [], questions: [], topics: [] };

  const hasAnyResults =
    results.experiences.length > 0 ||
    results.companies.length > 0 ||
    results.questions.length > 0 ||
    results.topics.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Header & Large Search Form */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-8 sm:p-12 shadow-sm space-y-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Search
          </h1>
        </div>

        <form action="/search" method="GET" className="relative z-10 max-w-3xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              autoFocus
              placeholder="Search companies, roles, technical questions or interview topics..."
              className="w-full rounded-2xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] py-3.5 sm:py-4 pl-12 pr-28 text-sm sm:text-base text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 active:scale-95"
            >
              Search
            </button>
          </div>

          {/* Quick search pills */}
          <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Trending:</span>
            {POPULAR_SEARCHES.map((item) => (
              <Link
                key={item}
                href={`/search?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#16181e] px-2.5 py-0.5 text-xs text-slate-600 dark:text-zinc-300 hover:border-blue-500/50 hover:text-blue-500 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </form>
      </div>

      {query && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1">
          <div>
            Showing search results for <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">"{query}"</span>
          </div>
        </div>
      )}

      {query && !hasAnyResults && (
        <div className="text-center py-20 border border-dashed border-stone-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-[#111317] p-8 space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500">
            <Search className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">No results found for "{query}"</h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            We couldn't find anything matching your query. Check your spelling or try searching for broader terms like "Linux", "SQL", or "Campus".
          </p>
          <div className="pt-2">
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-all"
            >
              Browse All Experiences
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Grouped Results */}
      {query && hasAnyResults && (
        <div className="space-y-10">
          {/* Companies Results */}
          {results.companies.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-3">
                <Building2 className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Companies ({results.companies.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.companies.map((c) => (
                  <Link
                    key={c.id}
                    href={`/companies/${c.slug}`}
                    className="group rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-5 hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {c.name}
                      </h4>
                      <ArrowRight className="h-4 w-4 text-slate-400 dark:text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      {c._count.experiences} verified {c._count.experiences === 1 ? "experience" : "experiences"}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Questions Results */}
          {results.questions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-3">
                <HelpCircle className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Questions ({results.questions.length})
                </h2>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#111317] overflow-hidden shadow-xs">
                {results.questions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/questions/${q.slug}`}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-stone-50 dark:hover:bg-[#16181e] transition-colors group"
                  >
                    <div className="space-y-1 pr-4">
                      <p className="text-sm sm:text-base font-medium text-slate-800 dark:text-zinc-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {q.text}
                      </p>
                      {q.topic && (
                        <span className="inline-block rounded-full bg-stone-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs text-slate-600 dark:text-zinc-400">
                          {q.topic.name}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 dark:text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Experiences Results */}
          {results.experiences.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-3">
                <FileText className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Interview Experiences ({results.experiences.length})
                </h2>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#111317] overflow-hidden shadow-xs">
                {results.experiences.map((exp) => (
                  <ExperienceRow
                    key={exp.id}
                    experience={{
                      id: exp.id,
                      slug: exp.slug,
                      company: exp.company,
                      role: exp.role,
                      interviewYear: exp.interviewYear,
                      placementType: exp.placementType,
                      result: exp.result,
                      overallExperience: exp.overallExperience,
                      isDemo: exp.isDemo,
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
