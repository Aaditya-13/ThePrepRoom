import Link from "next/link";
import { TrendingUp, Building2, BookOpen, PenLine, Eye, ArrowRight, Sparkles } from "lucide-react";
import { formatResultStatus } from "@/lib/utils";

interface TrendingExperience {
  id: string;
  slug: string;
  interviewYear: number;
  result: string;
  viewsCount: number;
  company: { name: string; slug: string };
  role: { title: string; slug: string };
}

interface TrendingCompany {
  name: string;
  slug: string;
  _count: {
    experiences: number;
  };
}

interface TrendingTopic {
  name: string;
  slug: string;
  _count: {
    questions: number;
  };
}

interface ExperienceRightSidebarProps {
  trendingExperiences: TrendingExperience[];
  trendingCompanies: TrendingCompany[];
  trendingTopics: TrendingTopic[];
}

export function ExperienceRightSidebar({
  trendingExperiences,
  trendingCompanies,
  trendingTopics,
}: ExperienceRightSidebarProps) {
  return (
    <div className="space-y-5">
      {/* 1. TRENDING INTERVIEW EXPERIENCES */}
      <div className="bg-[#111317] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-400">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Trending Experiences
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Most Viewed
          </span>
        </div>

        <div className="space-y-2.5">
          {trendingExperiences.map((exp) => {
            const resultInfo = formatResultStatus(exp.result);
            return (
              <Link
                key={exp.id}
                href={`/experiences/${exp.slug}`}
                className="block rounded-xl border border-zinc-800/60 bg-[#16181e]/80 p-3 hover:border-blue-500/40 hover:bg-[#1a1d24] transition-all group outline-none"
              >
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-1">
                  <span className="font-semibold text-zinc-300 group-hover:text-blue-400 transition-colors truncate">
                    {exp.company.name}
                  </span>
                  <span className="font-mono text-zinc-500">{exp.interviewYear}</span>
                </div>

                <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                  {exp.role.title}
                </h4>

                <div className="mt-2 flex items-center justify-between pt-1 text-[10px]">
                  <span
                    className={`px-1.5 py-0.5 rounded-md font-semibold text-[10px] ${resultInfo.badgeClass}`}
                  >
                    {resultInfo.label}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-zinc-500">
                    <Eye className="h-3 w-3" />
                    {exp.viewsCount}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 2. TRENDING RECRUITING COMPANIES */}
      {trendingCompanies.length > 0 && (
        <div className="bg-[#111317] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Trending Companies
              </h3>
            </div>
            <Link
              href="/companies"
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-0.5"
            >
              <span>View all</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {trendingCompanies.map((c) => (
              <Link
                key={c.slug}
                href={`/experiences?company=${c.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/70 bg-zinc-800/60 px-2.5 py-1 text-xs text-zinc-300 hover:border-blue-500/50 hover:text-blue-400 hover:bg-zinc-800 transition-all outline-none"
              >
                <span>{c.name}</span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900/80 px-1.5 py-0.2 rounded-md">
                  {c._count.experiences}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3. TRENDING PREPARATION TOPICS */}
      {trendingTopics.length > 0 && (
        <div className="bg-[#111317] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-400">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Trending Prep Topics
              </h3>
            </div>
            <Link
              href="/prepare"
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-0.5"
            >
              <span>Roadmaps</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>

          <div className="space-y-1.5">
            {trendingTopics.map((t) => (
              <Link
                key={t.slug}
                href={`/questions?topic=${t.slug}`}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/60 transition-all group outline-none"
              >
                <span className="group-hover:text-blue-400 transition-colors font-medium">
                  {t.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {t._count.questions} questions
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 4. SHARE EXPERIENCE CTA CARD */}
      <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-950/30 via-[#111317] to-[#111317] p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-blue-400">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Recently Interviewed?</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Pay it forward. Share your interview rounds, questions, and insights to guide junior students preparing for placements.
        </p>
        <Link
          href="/share"
          className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] outline-none"
        >
          <PenLine className="h-3.5 w-3.5" />
          <span>Share Your Journey</span>
        </Link>
      </div>
    </div>
  );
}
