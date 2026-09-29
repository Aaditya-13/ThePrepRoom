"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, ChevronDown, Check } from "lucide-react";
import { ExperienceRow } from "./experience-row";
import { loadMoreExperiencesAction } from "@/actions/experience";

export interface ExperienceFeedItem {
  id: string;
  slug: string;
  status?: string;
  viewsCount?: number;
  company: { name: string; slug: string };
  role: { title: string; slug: string };
  interviewYear: number;
  placementType: string;
  result: string;
  overallExperience: string;
  isDemo?: boolean;
  rounds?: { roundType: string; roundName?: string }[];
  isBookmarked?: boolean;
}

interface ExperienceFeedProps {
  initialExperiences: ExperienceFeedItem[];
  totalCount: number;
  initialFilters: {
    query?: string;
    companySlug?: string;
    roleSlug?: string;
    interviewYear?: number;
    placementType?: string;
    roundType?: string;
    result?: string;
    sortBy?: "newest" | "views";
  };
}

export function ExperienceFeed({
  initialExperiences,
  totalCount,
  initialFilters,
}: ExperienceFeedProps) {
  const [experiences, setExperiences] = useState<ExperienceFeedItem[]>(initialExperiences);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync state whenever server re-renders initialExperiences (e.g. search / filter changed)
  useEffect(() => {
    setExperiences(initialExperiences);
    setPage(1);
  }, [initialExperiences]);

  const hasMore = experiences.length < totalCount;
  const remainingCount = totalCount - experiences.length;

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await loadMoreExperiencesAction({
        ...initialFilters,
        page: nextPage,
        limit: 6,
      });

      if (res && res.experiences && res.experiences.length > 0) {
        setExperiences((prev) => [...prev, ...res.experiences]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error("Failed to load more experiences:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (experiences.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-[#111317] p-8 shadow-xs">
        <h3 className="text-base font-semibold text-white">No experiences found</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          No experiences matched your current filter criteria. Be the first to share your interview experience and help your peers!
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Stream of Experience Cards */}
      <div className="space-y-3.5">
        {experiences.map((exp) => (
          <ExperienceRow key={exp.id} experience={exp} />
        ))}
      </div>

      {/* Incremental Load More Action */}
      {hasMore ? (
        <div className="pt-5 pb-3 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-7 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 outline-none cursor-pointer"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Loading experiences...</span>
              </>
            ) : (
              <>
                <span>Load More Experiences</span>
                <ChevronDown className="h-4 w-4 text-blue-200" />
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
