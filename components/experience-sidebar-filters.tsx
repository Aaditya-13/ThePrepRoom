"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useMemo } from "react";
import {
  Filter,
  X,
  Check,
  Building2,
  Briefcase,
  Award,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

interface CompanyWithCount {
  name: string;
  slug: string;
  _count?: {
    experiences: number;
  };
}

interface RoleWithCount {
  title: string;
  slug: string;
  _count?: {
    experiences: number;
  };
}

interface ExperienceSidebarFiltersProps {
  companies: CompanyWithCount[];
  roles: RoleWithCount[];
  years: number[];
  initialFilters: {
    companySlug?: string;
    roleSlug?: string;
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
  roles,
  years,
  initialFilters,
}: ExperienceSidebarFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Active filter params
  const currentCompany = searchParams.get("company") || initialFilters.companySlug || "ALL";
  const currentRole = searchParams.get("role") || initialFilters.roleSlug || "ALL";
  const currentResult = searchParams.get("result") || initialFilters.result || "ALL";
  const currentPlacement = searchParams.get("placement") || initialFilters.placementType || "ALL";
  const currentYear = searchParams.get("year") || initialFilters.interviewYear || "ALL";
  const currentRound = searchParams.get("round") || initialFilters.roundType || "ALL";

  // Dropdown open states (Company and Role open by default, or auto-open if filter active)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    company: true,
    role: currentRole !== "ALL",
    outcome: currentResult !== "ALL",
    placement: currentPlacement !== "ALL",
    year: currentYear !== "ALL",
    round: currentRound !== "ALL",
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Search feature states inside dropdowns
  const [companySearch, setCompanySearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");

  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companies;
    const q = companySearch.toLowerCase().trim();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, companySearch]);

  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles;
    const q = roleSearch.toLowerCase().trim();
    return roles.filter((r) => r.title.toLowerCase().includes(q));
  }, [roles, roleSearch]);

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
    currentRole !== "ALL",
    currentResult !== "ALL",
    currentPlacement !== "ALL",
    currentYear !== "ALL",
    currentRound !== "ALL",
  ].filter(Boolean).length;

  // Selected label helper
  const selectedCompanyName =
    currentCompany === "ALL"
      ? null
      : companies.find((c) => c.slug === currentCompany)?.name || currentCompany;

  const selectedRoleName =
    currentRole === "ALL"
      ? null
      : roles.find((r) => r.slug === currentRole)?.title || currentRole;

  const selectedOutcomeName =
    currentResult === "ALL"
      ? null
      : OUTCOME_OPTIONS.find((o) => o.value === currentResult)?.label;

  const selectedPlacementName =
    currentPlacement === "ALL"
      ? null
      : PLACEMENT_OPTIONS.find((p) => p.value === currentPlacement)?.label;

  const selectedRoundName =
    currentRound === "ALL"
      ? null
      : ROUND_OPTIONS.find((r) => r.value === currentRound)?.label;

  return (
    <div className="bg-[#111317] border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors space-y-4">
      {/* Sidebar Header / Mobile Toggle Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
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
      <div className={`space-y-3 pt-1 ${isMobileOpen ? "block" : "hidden lg:block"}`}>
        {/* 1. COMPANY DROPDOWN WITH SEARCH */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#16181e]/60 overflow-hidden transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("company")}
            className={`w-full flex items-center justify-between p-3 text-xs font-semibold tracking-wide transition-colors outline-none ${
              currentCompany !== "ALL"
                ? "text-blue-400 bg-blue-500/10"
                : "text-zinc-200 hover:text-white hover:bg-zinc-800/40"
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
              <span>Company</span>
              {selectedCompanyName && (
                <span className="max-w-[100px] truncate text-[11px] font-normal text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded">
                  {selectedCompanyName}
                </span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                openSections.company ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.company && (
            <div className="p-3 pt-1 border-t border-zinc-800/70 space-y-2">
              {/* Company Search Feature */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Search companies..."
                  className="w-full rounded-lg border border-zinc-700/80 bg-zinc-800/90 py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-zinc-500 focus:border-blue-400 focus:outline-none"
                />
                {companySearch && (
                  <button
                    type="button"
                    onClick={() => setCompanySearch("")}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Options List */}
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => updateParam("company", "ALL")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left outline-none ${
                    currentCompany === "ALL"
                      ? "bg-blue-500/15 text-blue-400 font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <span>All Companies</span>
                  {currentCompany === "ALL" && <Check className="h-3.5 w-3.5 text-blue-400" />}
                </button>

                {filteredCompanies.length === 0 ? (
                  <div className="py-2 text-center text-xs text-zinc-500">No companies found</div>
                ) : (
                  filteredCompanies.map((c) => {
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
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                        }`}
                      >
                        <span className="truncate pr-2">{c.name}</span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {count > 0 && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
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
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. JOB ROLE DROPDOWN WITH SEARCH (NEW FILTER) */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#16181e]/60 overflow-hidden transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("role")}
            className={`w-full flex items-center justify-between p-3 text-xs font-semibold tracking-wide transition-colors outline-none ${
              currentRole !== "ALL"
                ? "text-blue-400 bg-blue-500/10"
                : "text-zinc-200 hover:text-white hover:bg-zinc-800/40"
            }`}
          >
            <span className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
              <span>Job Role</span>
              {selectedRoleName && (
                <span className="max-w-[100px] truncate text-[11px] font-normal text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded">
                  {selectedRoleName}
                </span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                openSections.role ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.role && (
            <div className="p-3 pt-1 border-t border-zinc-800/70 space-y-2">
              {/* Role Search Feature */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  placeholder="Search roles (e.g. SDE, Analyst)..."
                  className="w-full rounded-lg border border-zinc-700/80 bg-zinc-800/90 py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-zinc-500 focus:border-blue-400 focus:outline-none"
                />
                {roleSearch && (
                  <button
                    type="button"
                    onClick={() => setRoleSearch("")}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Options List */}
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => updateParam("role", "ALL")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left outline-none ${
                    currentRole === "ALL"
                      ? "bg-blue-500/15 text-blue-400 font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  <span>All Roles</span>
                  {currentRole === "ALL" && <Check className="h-3.5 w-3.5 text-blue-400" />}
                </button>

                {filteredRoles.length === 0 ? (
                  <div className="py-2 text-center text-xs text-zinc-500">No roles found</div>
                ) : (
                  filteredRoles.map((r) => {
                    const isSelected = currentRole === r.slug;
                    const count = r._count?.experiences ?? 0;
                    return (
                      <button
                        key={r.slug}
                        type="button"
                        onClick={() => updateParam("role", r.slug)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left outline-none group ${
                          isSelected
                            ? "bg-blue-500/15 text-blue-400 font-semibold"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                        }`}
                      >
                        <span className="truncate pr-2">{r.title}</span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {count > 0 && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
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
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. OUTCOME / RESULT DROPDOWN */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#16181e]/60 overflow-hidden transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("outcome")}
            className={`w-full flex items-center justify-between p-3 text-xs font-semibold tracking-wide transition-colors outline-none ${
              currentResult !== "ALL"
                ? "text-blue-400 bg-blue-500/10"
                : "text-zinc-200 hover:text-white hover:bg-zinc-800/40"
            }`}
          >
            <span className="flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-zinc-400" />
              <span>Outcome</span>
              {selectedOutcomeName && (
                <span className="text-[11px] font-normal text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded">
                  {selectedOutcomeName}
                </span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                openSections.outcome ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.outcome && (
            <div className="p-3 pt-1 border-t border-zinc-800/70 space-y-1">
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
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
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
          )}
        </div>

        {/* 4. PLACEMENT TYPE DROPDOWN */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#16181e]/60 overflow-hidden transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("placement")}
            className={`w-full flex items-center justify-between p-3 text-xs font-semibold tracking-wide transition-colors outline-none ${
              currentPlacement !== "ALL"
                ? "text-blue-400 bg-blue-500/10"
                : "text-zinc-200 hover:text-white hover:bg-zinc-800/40"
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-zinc-400" />
              <span>Placement Type</span>
              {selectedPlacementName && (
                <span className="text-[11px] font-normal text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded truncate max-w-[90px]">
                  {selectedPlacementName}
                </span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                openSections.placement ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.placement && (
            <div className="p-3 pt-1 border-t border-zinc-800/70 space-y-1">
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
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. INTERVIEW YEAR DROPDOWN */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#16181e]/60 overflow-hidden transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("year")}
            className={`w-full flex items-center justify-between p-3 text-xs font-semibold tracking-wide transition-colors outline-none ${
              currentYear !== "ALL"
                ? "text-blue-400 bg-blue-500/10"
                : "text-zinc-200 hover:text-white hover:bg-zinc-800/40"
            }`}
          >
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
              <span>Interview Year</span>
              {currentYear !== "ALL" && (
                <span className="text-[11px] font-mono text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded">
                  {currentYear}
                </span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                openSections.year ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.year && (
            <div className="p-3 pt-1 border-t border-zinc-800/70">
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
          )}
        </div>

        {/* 6. ROUNDS INCLUDED DROPDOWN */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#16181e]/60 overflow-hidden transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("round")}
            className={`w-full flex items-center justify-between p-3 text-xs font-semibold tracking-wide transition-colors outline-none ${
              currentRound !== "ALL"
                ? "text-blue-400 bg-blue-500/10"
                : "text-zinc-200 hover:text-white hover:bg-zinc-800/40"
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-zinc-400" />
              <span>Round Included</span>
              {selectedRoundName && (
                <span className="text-[11px] font-normal text-blue-300 bg-blue-500/20 px-1.5 py-0.2 rounded truncate max-w-[90px]">
                  {selectedRoundName}
                </span>
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                openSections.round ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.round && (
            <div className="p-3 pt-1 border-t border-zinc-800/70 space-y-1">
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
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
