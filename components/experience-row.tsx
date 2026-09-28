import Link from "next/link";
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
  const resultInfo = formatResultStatus(experience.result);

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
    <article className="group py-5 px-4 sm:px-6 border-b border-stone-200 dark:border-zinc-800/80 hover:bg-stone-50/70 dark:hover:bg-zinc-900/60 transition-colors duration-250 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Header metadata row */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/companies/${experience.company.slug}`}
              className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
            <Link
              href={`/experiences/${experience.slug}`}
              className="hover:text-blue-600 dark:hover:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
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
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-1 sm:pt-0 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${resultInfo.badgeClass}`}
            >
              {resultInfo.label}
            </span>
            <BookmarkButton
              targetType="EXPERIENCE"
              targetId={experience.id}
              initialBookmarked={experience.isBookmarked}
            />
          </div>

          <Link
            href={`/experiences/${experience.slug}`}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Experience</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
