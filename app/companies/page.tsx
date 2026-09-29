import Link from "next/link";
import { Search, Building2, ArrowRight } from "lucide-react";
import { getAllPublicCompanies } from "@/lib/public-queries";

export const metadata = {
  title: "Companies Directory",
  description: "Explore placement experiences, roles, and interview rounds by recruiting company.",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function CompaniesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const companies = await getAllPublicCompanies(searchParams.q);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 px-3 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <span>Recruiting Organizations</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white pt-1">
          Companies
        </h1>
        <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          Explore placement experiences, reported interview questions, and selection processes organized by company.
        </p>
      </div>

      {/* Search Input */}
      <form action="/companies" method="GET" className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q || ""}
            placeholder="Search companies by name..."
            className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-hidden transition-all shadow-xs"
          />
        </div>
      </form>

      {/* Companies Grid */}
      {companies.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#111317] p-8 shadow-xs">
          <Building2 className="mx-auto h-8 w-8 text-slate-400 dark:text-zinc-500 mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No companies found</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {searchParams.q ? `No companies matching "${searchParams.q}"` : "No companies registered yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              className="rounded-2xl border border-zinc-800/80 bg-[#121418] p-5 hover:border-blue-500/40 hover:-translate-y-0.5 active:scale-[0.995] transition-[transform,border-color,background-color,box-shadow] duration-200 shadow-xs hover:shadow-xl hover:shadow-black/40 group flex flex-col justify-between outline-none"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {company.name}
                  </h3>
                  {company.latestYear && (
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded-full font-semibold">
                      Hiring {company.latestYear}
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                  {company.industry || "Technology & Services"}
                </p>

                {company.sampleRoles.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {company.sampleRoles.slice(0, 2).map((role) => (
                      <span
                        key={role}
                        className="rounded-full border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-0.5 text-[11px] text-zinc-300 truncate max-w-[150px]"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>
                  {company.approvedExperiencesCount}{" "}
                  {company.approvedExperiencesCount === 1 ? "experience" : "experiences"} ·{" "}
                  {company.rolesCount} {company.rolesCount === 1 ? "role" : "roles"}
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform text-zinc-500 group-hover:text-blue-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
