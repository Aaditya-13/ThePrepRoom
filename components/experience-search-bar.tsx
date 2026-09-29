"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface ExperienceSearchBarProps {
  totalCount: number;
  filteredCount: number;
  initialQuery?: string;
  initialSort?: string;
  initialFilters?: {
    company?: string;
    role?: string;
    result?: string;
    placement?: string;
    year?: string;
    round?: string;
    q?: string;
  };
  companies?: { name: string; slug: string }[];
  roles?: { title: string; slug: string }[];
  onOpenMobileFilters?: () => void;
  activeFiltersCount?: number;
}

export function ExperienceSearchBar({
  totalCount,
  filteredCount,
  initialQuery = "",
  initialSort = "newest",
  initialFilters,
  companies = [],
  roles = [],
  onOpenMobileFilters,
  activeFiltersCount = 0,
}: ExperienceSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery || initialFilters?.q || "");

  // Keep query in sync if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get("q") || initialFilters?.q || "");
  }, [searchParams, initialFilters?.q]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value.trim()) {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", query);
  };

  const handleClearQuery = () => {
    setQuery("");
    updateParam("q", null);
  };

  const handleRemoveFilter = (key: string) => {
    updateParam(key, null);
  };

  const handleRemoveCompanySlug = (slugToRemove: string) => {
    const raw = searchParams.get("company") || initialFilters?.company || "";
    const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const updated = list.filter((s) => s !== slugToRemove);
    updateParam("company", updated.length > 0 ? updated.join(",") : null);
  };

  const handleRemoveRoleSlug = (slugToRemove: string) => {
    const raw = searchParams.get("role") || initialFilters?.role || "";
    const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const updated = list.filter((s) => s !== slugToRemove);
    updateParam("role", updated.length > 0 ? updated.join(",") : null);
  };

  const currentSort = searchParams.get("sort") || initialSort || "newest";
  const currentCompany = searchParams.get("company") || initialFilters?.company;
  const currentRole = searchParams.get("role") || initialFilters?.role;
  const currentResult = searchParams.get("result") || initialFilters?.result;
  const currentPlacement = searchParams.get("placement") || initialFilters?.placement;
  const currentYear = searchParams.get("year") || initialFilters?.year;
  const currentRound = searchParams.get("round") || initialFilters?.round;
  const currentQ = searchParams.get("q") || initialFilters?.q;

  const companySlugs = currentCompany
    ? currentCompany.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const roleSlugs = currentRole
    ? currentRole.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const hasAnyActiveFilter = Boolean(
    companySlugs.length > 0 ||
      roleSlugs.length > 0 ||
      currentResult ||
      currentPlacement ||
      currentYear ||
      currentRound ||
      currentQ
  );

  return (
    <div className="space-y-3.5">
      {/* Search Input Box */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex items-center gap-2 bg-[#111317] border border-zinc-800/80 rounded-2xl p-2 sm:p-2.5 shadow-xs"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            suppressHydrationWarning
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search experiences (company, role, questions, tech stack)..."
            className="w-full rounded-xl border border-zinc-700/80 bg-zinc-800/70 py-2 pl-10 pr-9 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-blue-400 focus:outline-none transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={handleClearQuery}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 outline-none shrink-0"
        >
          Search
        </button>
      </form>

      {/* Meta Bar: Results count, Active dismissible chips & Sort Order */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Results & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle Button */}
          {onOpenMobileFilters && (
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/80 text-zinc-300 hover:text-white text-xs font-medium"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-400" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="h-4 px-1.5 rounded-full bg-blue-600 text-white font-mono text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}

          <span className="text-zinc-400 font-mono text-xs">
            Showing <span className="font-semibold text-zinc-200">{filteredCount}</span> of {totalCount} experiences
          </span>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-zinc-500 text-xs hidden sm:inline flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" />
            Sort:
          </span>
          <select
            suppressHydrationWarning
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-lg border border-zinc-700/80 bg-zinc-800/80 py-1 px-2.5 text-xs text-zinc-200 focus:border-blue-400 focus:outline-none transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasAnyActiveFilter && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider pr-1">
            Active:
          </span>

          {currentQ && (
            <button
              onClick={() => handleRemoveFilter("q")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors"
            >
              <span>Query: &ldquo;{currentQ}&rdquo;</span>
              <X className="h-3 w-3" />
            </button>
          )}

          {companySlugs.map((slug) => {
            const companyName = companies.find((c) => c.slug === slug)?.name || slug;
            return (
              <button
                key={`company-${slug}`}
                onClick={() => handleRemoveCompanySlug(slug)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors"
              >
                <span>Company: {companyName}</span>
                <X className="h-3 w-3" />
              </button>
            );
          })}

          {roleSlugs.map((slug) => {
            const roleTitle = roles.find((r) => r.slug === slug)?.title || slug.replace(/-/g, " ");
            return (
              <button
                key={`role-${slug}`}
                onClick={() => handleRemoveRoleSlug(slug)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors capitalize"
              >
                <span>Role: {roleTitle}</span>
                <X className="h-3 w-3" />
              </button>
            );
          })}

          {currentResult && (
            <button
              onClick={() => handleRemoveFilter("result")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors capitalize"
            >
              <span>Outcome: {currentResult.toLowerCase()}</span>
              <X className="h-3 w-3" />
            </button>
          )}

          {currentPlacement && (
            <button
              onClick={() => handleRemoveFilter("placement")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors capitalize"
            >
              <span>Type: {currentPlacement.toLowerCase().replace("_", " ")}</span>
              <X className="h-3 w-3" />
            </button>
          )}

          {currentYear && (
            <button
              onClick={() => handleRemoveFilter("year")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors"
            >
              <span>Year: {currentYear}</span>
              <X className="h-3 w-3" />
            </button>
          )}

          {currentRound && (
            <button
              onClick={() => handleRemoveFilter("round")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 transition-colors capitalize"
            >
              <span>Round: {currentRound.toLowerCase().replace("_", " ")}</span>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
