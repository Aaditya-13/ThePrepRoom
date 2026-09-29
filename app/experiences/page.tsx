import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPublicExperiences } from "@/lib/public-queries";
import { ExperienceRow } from "@/components/experience-row";
import { ExperienceSidebarFilters } from "@/components/experience-sidebar-filters";
import { ExperienceSearchBar } from "@/components/experience-search-bar";
import { ExperienceRightSidebar } from "@/components/experience-right-sidebar";

export const metadata = {
  title: "Interview Experiences",
  description:
    "Real placement experiences shared by students. Filter by company, year, rounds, or outcome to inspect what came before you.",
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

  const [
    data,
    companies,
    availableYears,
    trendingExperiences,
    trendingCompanies,
    trendingTopics,
  ] = await Promise.all([
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
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            experiences: {
              where: { status: "APPROVED" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.experience.findMany({
      where: { status: "APPROVED" },
      select: { interviewYear: true },
      distinct: ["interviewYear"],
      orderBy: { interviewYear: "desc" },
    }),
    prisma.experience.findMany({
      where: { status: "APPROVED" },
      take: 3,
      orderBy: { viewsCount: "desc" },
      include: {
        company: { select: { name: true, slug: true } },
        role: { select: { title: true, slug: true } },
      },
    }),
    prisma.company.findMany({
      where: {
        experiences: {
          some: { status: "APPROVED" },
        },
      },
      take: 6,
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            experiences: {
              where: { status: "APPROVED" },
            },
          },
        },
      },
      orderBy: {
        experiences: {
          _count: "desc",
        },
      },
    }),
    prisma.topic.findMany({
      take: 4,
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        questions: {
          _count: "desc",
        },
      },
    }),
  ]);

  const years = availableYears.map((y) => y.interviewYear);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Interview Experiences
        </h1>
      </div>

      {/* 3-Column Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Amazon/Flipkart-style Filters */}
        <aside className="lg:col-span-3 xl:col-span-3 lg:sticky lg:top-20">
          <ExperienceSidebarFilters
            companies={companies}
            years={years}
            initialFilters={{
              companySlug: searchParams.company,
              interviewYear: searchParams.year,
              placementType: searchParams.placement,
              roundType: searchParams.round,
              result: searchParams.result,
            }}
          />
        </aside>

        {/* Middle Column: Prominent Search Bar & Experience Stream */}
        <section className="lg:col-span-6 xl:col-span-6 space-y-4 min-w-0">
          <ExperienceSearchBar
            totalCount={data.totalCount}
            filteredCount={data.experiences.length}
            initialQuery={searchParams.q}
            initialSort={searchParams.sort}
            initialFilters={{
              company: searchParams.company,
              result: searchParams.result,
              placement: searchParams.placement,
              year: searchParams.year,
              round: searchParams.round,
              q: searchParams.q,
            }}
          />

          {/* Experiences List */}
          {data.experiences.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-[#111317] p-8 shadow-xs">
              <h3 className="text-base font-bold text-white">No experiences found</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No approved experiences matched your current filter criteria. Try clearing some filters or be the first to share one.
              </p>
              <div className="mt-4">
                <Link
                  href="/share"
                  className="rounded-full bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 outline-none inline-block"
                >
                  Share Your Experience
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
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
                    className={`min-w-9 h-9 px-2 flex items-center justify-center rounded-xl text-xs font-mono font-semibold transition-all outline-none ${
                      isCurrent
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105"
                        : "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-blue-500 hover:text-blue-400"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Trending Interview Experiences & Widgets */}
        <aside className="lg:col-span-3 xl:col-span-3 lg:sticky lg:top-20">
          <ExperienceRightSidebar
            trendingExperiences={trendingExperiences}
            trendingCompanies={trendingCompanies}
            trendingTopics={trendingTopics}
          />
        </aside>
      </div>
    </div>
  );
}
