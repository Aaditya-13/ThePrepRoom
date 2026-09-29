import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPublicExperiences } from "@/lib/public-queries";
import { ExperienceFeed } from "@/components/experience-feed";
import { ExperienceSidebarFilters } from "@/components/experience-sidebar-filters";
import { ExperienceSearchBar } from "@/components/experience-search-bar";
import { ExperienceRightSidebar } from "@/components/experience-right-sidebar";
import { StickySidebar } from "@/components/sticky-sidebar";

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
    roles,
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
      limit: 6,
    }),
    prisma.company.findMany({
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            experiences: {
              where: { status: { in: ["APPROVED", "PENDING"] } },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.companyRole.findMany({
      where: {
        experiences: {
          some: { status: { in: ["APPROVED", "PENDING"] } },
        },
      },
      select: {
        title: true,
        slug: true,
        _count: {
          select: {
            experiences: {
              where: { status: { in: ["APPROVED", "PENDING"] } },
            },
          },
        },
      },
      orderBy: { title: "asc" },
    }),
    prisma.experience.findMany({
      where: { status: { in: ["APPROVED", "PENDING"] } },
      select: { interviewYear: true },
      distinct: ["interviewYear"],
      orderBy: { interviewYear: "desc" },
    }),
    prisma.experience.findMany({
      where: { status: { in: ["APPROVED", "PENDING"] } },
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
          some: { status: { in: ["APPROVED", "PENDING"] } },
        },
      },
      take: 6,
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            experiences: {
              where: { status: { in: ["APPROVED", "PENDING"] } },
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
        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-[-0.03em] text-white">
          Interview Experiences
        </h1>
      </div>

      {/* 3-Column Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Amazon/Flipkart-style Filters */}
        <StickySidebar className="lg:col-span-3 xl:col-span-3">
          <ExperienceSidebarFilters
            companies={companies}
            roles={roles}
            years={years}
            initialFilters={{
              companySlug: searchParams.company,
              roleSlug: searchParams.role,
              interviewYear: searchParams.year,
              placementType: searchParams.placement,
              roundType: searchParams.round,
              result: searchParams.result,
            }}
          />
        </StickySidebar>

        {/* Middle Column: Prominent Search Bar & Experience Stream */}
        <section className="lg:col-span-6 xl:col-span-6 space-y-4 min-w-0">
          <ExperienceSearchBar
            totalCount={data.totalCount}
            filteredCount={data.totalCount}
            initialQuery={searchParams.q}
            initialSort={searchParams.sort}
            companies={companies}
            roles={roles}
            initialFilters={{
              company: searchParams.company,
              role: searchParams.role,
              result: searchParams.result,
              placement: searchParams.placement,
              year: searchParams.year,
              round: searchParams.round,
              q: searchParams.q,
            }}
          />

          {/* Incremental Experience Feed (Shows 5-6 initial, with Load More Experiences option) */}
          <ExperienceFeed
            initialExperiences={data.experiences}
            totalCount={data.totalCount}
            initialFilters={{
              query: searchParams.q,
              companySlug: searchParams.company,
              roleSlug: searchParams.role,
              interviewYear,
              placementType: searchParams.placement,
              roundType: searchParams.round,
              result: searchParams.result,
              sortBy: searchParams.sort || "newest",
            }}
          />
        </section>

        {/* Right Column: Trending Interview Experiences & Widgets */}
        <StickySidebar className="lg:col-span-3 xl:col-span-3">
          <ExperienceRightSidebar
            trendingExperiences={trendingExperiences}
            trendingCompanies={trendingCompanies}
            trendingTopics={trendingTopics}
          />
        </StickySidebar>
      </div>
    </div>
  );
}
