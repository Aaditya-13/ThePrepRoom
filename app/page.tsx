import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  PenLine,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getPublicStats,
  getPopularCompanies,
  getPublicQuestions,
} from "@/lib/public-queries";
import { HeroIllustration } from "@/components/hero-illustration";
import { TopStoriesCarousel } from "@/components/top-stories-carousel";
import { getUserInitials } from "@/lib/user-utils";

export const revalidate = 30; // 30s ISR for sub-50ms page loads with instant revalidatePath invalidation

export default async function HomePage() {
  const [stats, popularCompanies, topQuestions, featuredExperiences, topStories] =
    await Promise.all([
      getPublicStats(),
      getPopularCompanies(8),
      getPublicQuestions({}),
      prisma.experience.findMany({
        where: { status: { in: ["APPROVED", "PENDING"] } },
        take: 4,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        include: {
          company: true,
          role: true,
          user: true,
          rounds: true,
        },
      }),
      prisma.experience.findMany({
        where: { status: { in: ["APPROVED", "PENDING"] } },
        take: 6,
        orderBy: { viewsCount: "desc" },
        include: {
          company: true,
          role: true,
          user: true,
        },
      }),
    ]);

  const featuredQuestions = topQuestions.slice(0, 4);

  // Sample tag colors for diversity in featured cards
  const TAG_STYLES = [
    { label: "DSA", bg: "bg-lime-400/10 text-lime-400 border-lime-400/20" },
    { label: "Core CS", bg: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
    { label: "On-Campus", bg: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
    { label: "Technical", bg: "bg-purple-400/10 text-purple-400 border-purple-400/20" },
  ];

  return (
    <div className="min-h-screen bg-[#090a0d] text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 min-h-[calc(100vh-4rem)] flex items-center py-10 lg:py-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.03em] text-white leading-[1.1]">
                Know the drill.
                <span className="block text-blue-500 mt-1 sm:mt-2">
                  Before you face&nbsp;it.
                </span>
              </h1>

              <p className="font-body text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-normal mx-auto lg:mx-0">
                Real placement experiences, questions, and insights from students who&apos;ve been there.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/experiences"
                  className="h-11 sm:h-12 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Explore Experiences</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/share"
                  className="h-11 sm:h-12 px-6 rounded-full border border-zinc-700 bg-zinc-900 text-white font-medium text-sm inline-flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xs"
                >
                  <PenLine className="h-4 w-4 text-blue-400" />
                  <span>Share Your Journey</span>
                </Link>

                <Link
                  href="/companies"
                  className="h-11 sm:h-12 px-5 rounded-full border border-zinc-800 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 font-medium text-sm inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xs"
                >
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span>Company Stats</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Graphic Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED INTERVIEWS SECTION */}
      <section className="py-16 sm:py-20 border-b border-zinc-800/80 bg-[#0c0e12]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-heading">
                Featured Interviews
              </h2>
              <p className="font-body text-xs sm:text-sm text-zinc-400 mt-1">
                Handpicked interview journeys from students who recently cracked top opportunities.
              </p>
            </div>
            <Link
              href="/experiences"
              className="text-xs sm:text-sm font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5 group transition-colors"
            >
              <span>View all stories</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* 4-Card Grid or Empty State Callout */}
          {featuredExperiences.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#111317]/80 p-8 sm:p-12 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mx-auto">
                <PenLine className="h-6 w-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Be the First to Share an Experience
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400">
                  No interview experiences have been published yet. Help your college peers by sharing your recent recruitment rounds, questions, and insights.
                </p>
              </div>
              <Link
                href="/share"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <PenLine className="h-4 w-4" />
                <span>Share Your Experience</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredExperiences.map((exp, idx) => {
                const tagStyle = TAG_STYLES[idx % TAG_STYLES.length];
                const authorName = exp.isAnonymous ? "Anonymous Candidate" : exp.user?.name || "Student";
                const authorInitials = getUserInitials(authorName);

                return (
                  <Link
                    key={exp.id}
                    href={`/experiences/${exp.slug}`}
                    className="rounded-2xl border border-zinc-800/90 bg-[#121418] p-5 hover:border-blue-500/40 hover:-translate-y-0.5 active:scale-[0.995] transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out shadow-xs hover:shadow-xl hover:shadow-black/40 group flex flex-col justify-between cursor-pointer outline-none select-none"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Year · Department and Tag */}
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400 font-medium">
                          {exp.interviewYear} · {exp.user?.department || "CSE"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${tagStyle.bg}`}>
                          {tagStyle.label}
                        </span>
                      </div>

                      {/* Company and Role */}
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                          {exp.company.name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1 font-medium">
                          {exp.role.title}
                        </p>
                      </div>

                      {/* Excerpt */}
                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                        {exp.overallExperience}
                      </p>
                    </div>

                    {/* Card Bottom: Candidate & Views */}
                    <div className="mt-5 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px] overflow-hidden">
                          {exp.user?.image && !exp.isAnonymous ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={exp.user.image} alt={authorName} className="h-full w-full object-cover" />
                          ) : (
                            <span>{authorInitials}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-zinc-300 line-clamp-1">
                          {authorName}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-zinc-500">
                        {exp.viewsCount} {exp.viewsCount === 1 ? "view" : "views"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* RESOURCE CALLOUT BANNER */}
          <div className="rounded-2xl border border-zinc-800 bg-[#12141c] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white font-heading">
                  New to placement drives?
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 max-w-xl">
                  Inspect high-yield Core CS roadmaps, Linux administration essentials, and company-specific preparation patterns.
                </p>
              </div>
            </div>

            <Link
              href="/prepare"
              className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 text-xs sm:text-sm inline-flex items-center gap-1.5 shrink-0 transition-colors shadow-md shadow-blue-600/20"
            >
              <span>Explore Resources</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. "FIND EXPERIENCES THAT MATCH YOUR GOAL" SECTION (Image 3 reference) */}
      <section className="py-14 sm:py-18 border-b border-stone-200 dark:border-zinc-800/80 bg-white dark:bg-[#090a0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Find experiences that match your goal
            </h2>
            <p className="font-body text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Filter by company, batch year, or engineering branch and jump straight to the relevant interview patterns.
            </p>
          </div>

          {/* Interactive Filter Hub Card */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-stone-50/50 dark:bg-[#111317] p-6 sm:p-8 space-y-6">
            {/* Row 1: By Company */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 shrink-0">
                By Company
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {popularCompanies.map((c) => (
                  <Link
                    key={c.id}
                    href={`/experiences?company=${c.slug}`}
                    className="rounded-full border border-stone-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/60 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-2xs"
                  >
                    {c.name}
                  </Link>
                ))}
                <Link
                  href="/companies"
                  className="rounded-full border border-dashed border-stone-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
                >
                  + More Companies
                </Link>
              </div>
            </div>

            <div className="border-t border-stone-200/60 dark:border-zinc-800/80" />

            {/* Row 2: By Batch Year */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 shrink-0">
                By Interview Year
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[2027, 2026, 2025, 2024, 2023, 2022, 2021].map((year) => (
                  <Link
                    key={year}
                    href={`/experiences?year=${year}`}
                    className="rounded-full border border-stone-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/60 px-3.5 py-1.5 text-xs font-mono font-medium text-slate-700 dark:text-zinc-200 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-2xs"
                  >
                    {year}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-stone-200/60 dark:border-zinc-800/80" />

            {/* Row 3: By Department */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="w-32 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 shrink-0">
                By Department
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  "Computer Science",
                  "Information Technology",
                  "Electronics & Telecom",
                  "AI & Data Science",
                  "Mechanical",
                ].map((dept) => (
                  <Link
                    key={dept}
                    href={`/experiences?q=${encodeURIComponent(dept)}`}
                    className="rounded-full border border-stone-300 dark:border-zinc-700/80 bg-white dark:bg-zinc-800/60 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-2xs"
                  >
                    {dept}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TOP STORIES CAROUSEL SECTION */}
      {topStories.length > 0 && (
        <section className="py-14 sm:py-18 border-b border-stone-200 dark:border-zinc-800/80 bg-stone-50/40 dark:bg-[#0c0e12]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Top Stories
                </h2>
                <p className="font-body text-sm text-slate-600 dark:text-zinc-400 mt-1">
                  The most-read experiences from the community, ranked by what helped candidates most.
                </p>
              </div>
              <Link
                href="/experiences?sort=views"
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 inline-flex items-center gap-1 group"
              >
                <span>View all</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <TopStoriesCarousel stories={topStories} />
          </div>
        </section>
      )}

      {/* 5. HIGH-YIELD QUESTIONS PREVIEW */}
      <section className="py-14 sm:py-18 border-b border-stone-200 dark:border-zinc-800/80 bg-white dark:bg-[#090a0d]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Frequently Asked Technical Questions
              </h2>
              <p className="font-body text-sm text-slate-600 dark:text-zinc-400 mt-1">
                Canonical questions extracted from verified interviews, deduplicated and linked to recruiting companies.
              </p>
            </div>
            <Link
              href="/questions"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 inline-flex items-center gap-1"
            >
              <span>Question Bank ({stats.questionsCount})</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredQuestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-[#111317]/80 p-8 sm:p-10 text-center space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mx-auto">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Question Bank Is Warming Up</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
                Real interview questions will be displayed here as students share their interview rounds.
              </p>
              <div className="pt-2">
                <Link
                  href="/share"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  <span>Contribute Questions</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredQuestions.map((q) => (
                <Link
                  key={q.id}
                  href={`/questions/${q.slug}`}
                  className="rounded-xl border border-stone-200 dark:border-zinc-800/80 bg-stone-50/50 dark:bg-[#121418] p-4 sm:p-5 hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 ease-out group shadow-xs hover:shadow-lg hover:shadow-blue-950/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-blue-500 transition-colors leading-snug">
                      {q.text}
                    </h4>
                    <span className="shrink-0 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40 px-2 py-0.5 text-[11px] font-mono font-medium">
                      {q.frequencyCount}x asked
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                    <span className="font-medium text-slate-700 dark:text-zinc-300">
                      {q.topic?.name || "General Technical"}
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300 text-blue-500 font-medium">
                      View Asked-In Timeline →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. CALL TO ACTION STRIP */}
      <section className="py-14 sm:py-20 bg-stone-50 dark:bg-[#0c0e12]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Attended an interview recently?
          </h3>
          <p className="font-body text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
            Give back to your college community. Your detailed experience helps batchmates and juniors walk into interviews with clarity and confidence.
          </p>
          <div className="pt-2">
            <Link
              href="/share"
              className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 text-sm inline-flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PenLine className="h-4 w-4" />
              <span>Share Your Placement Experience</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
