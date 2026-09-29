"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPlacementType, formatResultStatus } from "@/lib/utils";
import { BookmarkButton } from "./bookmark-button";

interface ExperienceRowProps {
  experience: {
    id: string;
    slug: string;
    company: { name: string; slug: string };
    role: { title: string; slug: string };
    interviewYear: number;
    placementType: string;
    result: string;
    overallExperience: string;
    isDemo?: boolean;
    rounds?: { roundType: string; roundName?: string }[];
    isBookmarked?: boolean;
  };
}

export function ExperienceRow({ experience }: ExperienceRowProps) {
  const router = useRouter();
  const resultInfo = formatResultStatus(experience.result);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't intercept if user clicked on another link or button (e.g. company link or bookmark)
    if (target.closest("a, button, [role='button']")) {
      return;
    }
    router.push(`/experiences/${experience.slug}`);
  };

  // Format short preview excerpt
  const preview =
    experience.overallExperience.length > 180
      ? experience.overallExperience.slice(0, 180).trim() + "..."
      : experience.overallExperience;

  // Extract concise round names
  const roundTags =
    experience.rounds && experience.rounds.length > 0
      ? experience.rounds.map((r) => {
          switch (r.roundType) {
            case "ONLINE_ASSESSMENT":
              return "OA";
            case "GROUP_DISCUSSION":
              return "GD";
            case "TECHNICAL":
              return "Technical";
            case "HR":
              return "HR";
            case "APTITUDE":
              return "Aptitude";
            case "MANAGERIAL":
              return "Managerial";
            default:
              return r.roundName || "Round";
          }
        })
      : [];

  return (
    <article
      onClick={handleCardClick}
      className="group relative rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 sm:p-6 hover:border-blue-500/40 hover:bg-[#131620] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 active:scale-[0.995] transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out cursor-pointer select-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative z-10">
        <div className="space-y-2 flex-1 min-w-0">
          {/* Header metadata row */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/companies/${experience.company.slug}`}
              className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider hover:text-blue-500 transition-colors relative z-10"
            >
              {experience.company.name}
            </Link>
            <span className="text-stone-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
              {experience.interviewYear} · {formatPlacementType(experience.placementType)}
            </span>

            {/* Explicit Sample/Demo Indicator */}
            {experience.isDemo && (
              <span className="inline-flex items-center rounded-full border border-amber-300/60 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                Sample
              </span>
            )}
          </div>

          {/* Role Title */}
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-blue-400 transition-colors leading-snug">
            <Link
              href={`/experiences/${experience.slug}`}
              className="hover:text-blue-400 transition-colors"
            >
              {experience.role.title}
            </Link>
          </h3>

          {/* Rounds Sequence */}
          {roundTags.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
              <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-medium uppercase tracking-wider">
                Rounds:
              </span>
              <span className="font-mono text-slate-700 dark:text-zinc-300">
                {roundTags.join(" · ")}
              </span>
            </div>
          )}

          {/* Excerpt preview */}
          <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed pt-0.5 max-w-3xl line-clamp-2">
            {preview}
          </p>
        </div>

        {/* Right side: Result Badge & Action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pt-1 sm:pt-0 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${resultInfo.badgeClass}`}
            >
              {resultInfo.label}
            </span>
            <div className="relative z-10">
              <BookmarkButton
                targetType="EXPERIENCE"
                targetId={experience.id}
                initialBookmarked={experience.isBookmarked}
              />
            </div>
          </div>

          <span
            className="text-xs font-semibold text-blue-500 group-hover:text-blue-400 inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition-all duration-200"
          >
            <span>View Experience</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </article>
  );
}
