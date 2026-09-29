"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Filter, X, Check, Building2, Award, Calendar, Layers, Briefcase, ChevronDown, ChevronUp } from "lucide-react";

interface CompanyWithCount {
  name: string;
  slug: string;
  _count?: {
    experiences: number;
  };
}

interface ExperienceSidebarFiltersProps {
  companies: CompanyWithCount[];
  years: number[];
  initialFilters: {
    companySlug?: string;
    interviewYear?: string;
    placementType?: string;
    roundType?: string;
    result?: string;
  };
}

const OUTCOME_OPTIONS = [
  { value: "ALL", label: "All Outcomes", dot: null },
  { value: "SELECTED", label: "Selected", dot: "bg-emerald-400" },
  { value: "REJECTED", label: "Rejected", dot: "bg-rose-400" },
  { value: "WAITLISTED", label: "Waitlisted", dot: "bg-amber-400" },
  { value: "PENDING", label: "Result Pending", dot: "bg-blue-400" },
];

const PLACEMENT_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "CAMPUS", label: "Campus Placement" },
  { value: "OFF_CAMPUS", label: "Off-Campus" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "REFERRAL", label: "Referral" },
];

const ROUND_OPTIONS = [
  { value: "ALL", label: "Any Round" },
  { value: "ONLINE_ASSESSMENT", label: "Online Assessment (OA)" },
  { value: "TECHNICAL", label: "Technical Interview" },
  { value: "HR", label: "HR Interview" },
  { value: "GROUP_DISCUSSION", label: "Group Discussion" },
  { value: "APTITUDE", label: "Aptitude Test" },
];

export function ExperienceSidebarFilters({
  companies,
  years,
  initialFilters,
}: ExperienceSidebarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentCompany = searchParams.get("company") || initialFilters.companySlug || "ALL";
  const currentResult = searchParams.get("result") || initialFilters.result || "ALL";
  const currentPlacement = searchParams.get("placement") || initialFilters.placementType || "ALL";
  const currentYear = searchParams.get("year") || initialFilters.interviewYear || "ALL";
  const currentRound = searchParams.get("round") || initialFilters.roundType || "ALL";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset pagination

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Keep search query if present, clear filter selections
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);

    startTransition(() => {
      router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
    });
  };

  const activeFiltersCount = [
    currentCompany !== "ALL",
    currentResult !== "ALL",
    currentPlacement !== "ALL",
    currentYear !== "ALL",
    currentRound !== "ALL",
  ].filter(Boolean).length;

  return (
    <div className="bg-[#111317] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
      {/* Sidebar Header / Mobile Toggle Bar */}
      <div className="flex items-center justify-between pb-3 lg:border-b border-zinc-800/80">
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="flex items-center gap-2 outline-none lg:pointer-events-none w-full lg:w-auto justify-between lg:justify-start"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Filter className="h-4 w-4" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white tracking-tight">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="text-[11px] font-mono text-blue-400 font-medium">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
          </div>

          <div className="lg:hidden text-zinc-400 flex items-center gap-1.5 text-xs">
            <span>{isMobileOpen ? "Hide" : "Show"}</span>
            {isMobileOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            disabled={isPending}
            className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-zinc-800/70 transition-colors outline-none shrink-0"
          >
            <X className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Filter Sections (Always visible on lg, toggled on mobile) */}
      <div className={`space-y-6 pt-3 lg:pt-5 ${isMobileOpen ? "block" : "hidden lg:block"}`}>
        {/* 1. COMPANY FILTER */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-zinc-500" />
            Company
          </span>
          {currentCompany !== "ALL" && (
            <button
              onClick={() => updateParam("company", "ALL")}
              className="text-[10px] text-blue-400 hover:underline capitalize"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => updateParam("company", "ALL")}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left outline-none ${
              currentCompany === "ALL"
                ? "bg-blue-500/15 text-blue-400 font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 font-normal"
            }`}
          >
            <span>All Companies</span>
            {currentCompany === "ALL" && <Check className="h-3.5 w-3.5 text-blue-400" />}
          </button>

          {companies.map((c) => {
            const isSelected = currentCompany === c.slug;
            const count = c._count?.experiences ?? 0;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => updateParam("company", c.slug)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left outline-none group ${
                  isSelected
                    ? "bg-blue-500/15 text-blue-400 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 font-normal"
                }`}
              >
                <span className="truncate pr-2">{c.name}</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-800/80" />

      {/* 2. OUTCOME / RESULT FILTER */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-zinc-500" />
            Outcome
          </span>
          {currentResult !== "ALL" && (
            <button
              onClick={() => updateParam("result", "ALL")}
              className="text-[10px] text-blue-400 hover:underline capitalize"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1">
          {OUTCOME_OPTIONS.map((opt) => {
            const isSelected = currentResult === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateParam("result", opt.value)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left outline-none ${
                  isSelected
                    ? "bg-blue-500/15 text-blue-400 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 font-normal"
                }`}
              >
                <span className="flex items-center gap-2">
                  {opt.dot && <span className={`h-2 w-2 rounded-full ${opt.dot} shrink-0`} />}
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-800/80" />

      {/* 3. PLACEMENT TYPE FILTER */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
            Placement Type
          </span>
          {currentPlacement !== "ALL" && (
            <button
              onClick={() => updateParam("placement", "ALL")}
              className="text-[10px] text-blue-400 hover:underline capitalize"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1">
          {PLACEMENT_OPTIONS.map((opt) => {
            const isSelected = currentPlacement === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateParam("placement", opt.value)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left outline-none ${
                  isSelected
                    ? "bg-blue-500/15 text-blue-400 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 font-normal"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-800/80" />

      {/* 4. INTERVIEW YEAR FILTER */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
            Interview Year
          </span>
          {currentYear !== "ALL" && (
            <button
              onClick={() => updateParam("year", "ALL")}
              className="text-[10px] text-blue-400 hover:underline capitalize"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => updateParam("year", "ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors outline-none ${
              currentYear === "ALL"
                ? "bg-blue-600 text-white font-semibold shadow-xs"
                : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/80"
            }`}
          >
            All
          </button>
          {years.map((y) => {
            const isSelected = currentYear === y.toString();
            return (
              <button
                key={y}
                type="button"
                onClick={() => updateParam("year", y.toString())}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors outline-none ${
                  isSelected
                    ? "bg-blue-600 text-white font-semibold shadow-xs"
                    : "bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/80"
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-zinc-800/80" />

      {/* 5. ROUNDS INCLUDED FILTER */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-zinc-500" />
            Rounds
          </span>
          {currentRound !== "ALL" && (
            <button
              onClick={() => updateParam("round", "ALL")}
              className="text-[10px] text-blue-400 hover:underline capitalize"
            >
              Clear
            </button>
          )}
        </div>

        <div className="space-y-1">
          {ROUND_OPTIONS.map((opt) => {
            const isSelected = currentRound === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateParam("round", opt.value)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left outline-none ${
                  isSelected
                    ? "bg-blue-500/15 text-blue-400 font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 font-normal"
                }`}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);
}
