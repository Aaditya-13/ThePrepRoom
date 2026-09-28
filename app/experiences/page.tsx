import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPublicExperiences } from "@/lib/public-queries";
import { ExperienceRow } from "@/components/experience-row";
import { ExperienceFilters } from "@/components/experience-filters";

export const metadata = {
  title: "Interview Experiences",
  description:
    "Real placement experiences shared by students. Explore selection rounds, questions asked, and preparation advice.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    company?: string;
    role?: string;
    year?: string;
    placement?: string;
    round?: string;
    result?: string;
    sort?: "newest" | "views";
    page?: string;
  }>;
}

export default async function ExperiencesPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const interviewYear = searchParams.year ? parseInt(searchParams.year, 10) : undefined;

  const [data, companies, availableYears] = await Promise.all([
    getPublicExperiences({
      query: searchParams.q,
      companySlug: searchParams.company,
      roleSlug: searchParams.role,
      interviewYear,
      placementType: searchParams.placement,
      roundType: searchParams.round,
      result: searchParams.result,
      sortBy: searchParams.sort || "newest",
      page,
      limit: 12,
    }),
    prisma.company.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.experience.findMany({
      where: { status: "APPROVED" },
      select: { interviewYear: true },
      distinct: ["interviewYear"],
      orderBy: { interviewYear: "desc" },
    }),
  ]);

  const years = availableYears.map((y) => y.interviewYear);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Editorial Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 px-3 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <span>Placement Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white pt-1">
          Interview Experiences
        </h1>
        <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Real placement experiences shared by students. Filter by company, year, rounds, or outcome to inspect what came before you.
        </p>
      </div>

      {/* Filter Bar */}
      <ExperienceFilters
        companies={companies}
        years={years}
        initialFilters={{
          query: searchParams.q,
          companySlug: searchParams.company,
          interviewYear: searchParams.year,
          placementType: searchParams.placement,
          roundType: searchParams.round,
          result: searchParams.result,
          sortBy: searchParams.sort,
        }}
      />

      {/* Results Count & Meta */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1 font-mono">
        <span>
          Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{data.experiences.length}</span> of {data.totalCount} approved experiences
        </span>
        {data.totalPages > 1 && (
          <span>
            Page {data.currentPage} of {data.totalPages}
          </span>
        )}
      </div>

      {/* Experiences List */}
      {data.experiences.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#111317] p-8 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No experiences found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            No approved experiences matched your current filter criteria. Try clearing some filters or be the first to share one.
          </p>
          <div className="mt-4">
            <Link
              href="/share"
              className="rounded-full bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
            >
              Share Your Experience
            </Link>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#121418] overflow-hidden shadow-xs">
          {data.experiences.map((exp) => (
            <ExperienceRow key={exp.id} experience={exp} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => {
            const isCurrent = p === data.currentPage;
            const params = new URLSearchParams();
            if (searchParams.q) params.set("q", searchParams.q);
            if (searchParams.company) params.set("company", searchParams.company);
            if (searchParams.year) params.set("year", searchParams.year);
            if (searchParams.placement) params.set("placement", searchParams.placement);
            if (searchParams.round) params.set("round", searchParams.round);
            if (searchParams.result) params.set("result", searchParams.result);
            if (searchParams.sort) params.set("sort", searchParams.sort);
            params.set("page", p.toString());

            return (
              <Link
                key={p}
                href={`/experiences?${params.toString()}`}
                className={`min-w-9 h-9 px-2 flex items-center justify-center rounded-xl text-xs font-mono font-semibold transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105"
                    : "border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
