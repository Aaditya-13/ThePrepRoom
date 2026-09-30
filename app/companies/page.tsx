import Link from "next/link";
import { Search, Building2, ArrowRight, Eye } from "lucide-react";
import { getAllPublicCompanies } from "@/lib/public-queries";

export const revalidate = 60;

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
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-[-0.03em] text-white">
          Companies
        </h1>
      </div>

      {/* Search Input */}
      <form action="/companies" method="GET" className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q || ""}
            placeholder="Search companies by name..."
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:border-blue-400 focus:outline-hidden transition-all shadow-xs"
          />
        </div>
      </form>

      {/* Companies Grid */}
      {companies.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-[#111317] p-8 shadow-xs">
          <Building2 className="mx-auto h-8 w-8 text-zinc-500 mb-2" />
          <h3 className="text-base font-bold text-white">No companies found</h3>
          <p className="text-xs text-zinc-400 mt-1">
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
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                  <Eye className="h-3.5 w-3.5 text-blue-400/80" />
                  <span>{company.viewsCount || 0}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
