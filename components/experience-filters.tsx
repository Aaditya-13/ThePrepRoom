"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Filter, X } from "lucide-react";

interface FilterProps {
  companies: { name: string; slug: string }[];
  years: number[];
  initialFilters: {
    query?: string;
    companySlug?: string;
    interviewYear?: string;
    placementType?: string;
    roundType?: string;
    result?: string;
    sortBy?: string;
  };
}

export function ExperienceFilters({ companies, years, initialFilters }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialFilters.query || "");

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 on filter change

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", query.trim() || null);
  };

  const clearAllFilters = () => {
    setQuery("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    searchParams.has("q") ||
    searchParams.has("company") ||
    searchParams.has("year") ||
    searchParams.has("placement") ||
    searchParams.has("round") ||
    searchParams.has("result") ||
    searchParams.has("sort");

  return (
    <div className="bg-[#111317] border border-zinc-800/80 rounded-2xl p-5 sm:p-6 mb-8 space-y-5 shadow-xs transition-colors">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search within experiences (role, tech stack, notes)..."
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/70 py-2.5 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-blue-400 focus:outline-none transition-all shadow-2xs"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-600/20 outline-none"
        >
          Search
        </button>
      </form>

      {/* Multi-parameter Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3 border-t border-zinc-800/80 text-xs">
        {/* Company Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Company</label>
          <select
            value={searchParams.get("company") || "ALL"}
            onChange={(e) => updateParam("company", e.target.value)}
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-800/80 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Companies</option>
            {companies.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Interview Year Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Interview Year</label>
          <select
            value={searchParams.get("year") || "ALL"}
            onChange={(e) => updateParam("year", e.target.value)}
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-800/80 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Years</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Placement Type Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Placement Type</label>
          <select
            value={searchParams.get("placement") || "ALL"}
            onChange={(e) => updateParam("placement", e.target.value)}
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-800/80 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="CAMPUS">Campus Placement</option>
            <option value="OFF_CAMPUS">Off-Campus</option>
            <option value="REFERRAL">Referral</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        {/* Round Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Round Included</label>
          <select
            value={searchParams.get("round") || "ALL"}
            onChange={(e) => updateParam("round", e.target.value)}
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-800/80 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">Any Round</option>
            <option value="ONLINE_ASSESSMENT">Online Assessment</option>
            <option value="TECHNICAL">Technical Interview</option>
            <option value="HR">HR Interview</option>
            <option value="GROUP_DISCUSSION">Group Discussion</option>
            <option value="APTITUDE">Aptitude Test</option>
          </select>
        </div>

        {/* Result Filter */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Outcome</label>
          <select
            value={searchParams.get("result") || "ALL"}
            onChange={(e) => updateParam("result", e.target.value)}
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-800/80 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Results</option>
            <option value="SELECTED">Selected</option>
            <option value="REJECTED">Rejected</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="PENDING">Result Pending</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">Sort By</label>
          <select
            value={searchParams.get("sort") || "newest"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-800/80 py-1.5 px-2.5 text-xs text-zinc-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-zinc-800/80 text-xs text-slate-500 dark:text-zinc-400">
          <span>Active filters applied</span>
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
