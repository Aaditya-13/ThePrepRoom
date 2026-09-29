import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, Globe, Calendar, ArrowRight, HelpCircle, FileText } from "lucide-react";
import { getPublicCompanyBySlug } from "@/lib/public-queries";
import { ExperienceRow } from "@/components/experience-row";
import { BookmarkButton } from "@/components/bookmark-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const company = await getPublicCompanyBySlug(params.slug);

  if (!company) return { title: "Company Not Found" };

  return {
    title: `${company.name} Placement Experiences & Questions`,
    description: `Real placement experiences, interview rounds, and questions reported by students for ${company.name}.`,
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompanyDetailPage(props: PageProps) {
  const params = await props.params;
  const company = await getPublicCompanyBySlug(params.slug);

  if (!company) {
    notFound();
  }

  // Deduplicate sequence of unique rounds reported across approved experiences
  const uniqueRoundNames: string[] = [];
  company.experiences.forEach((exp) => {
    exp.rounds.forEach((r) => {
      const name = r.roundName || r.roundType;
      if (!uniqueRoundNames.includes(name)) {
        uniqueRoundNames.push(name);
      }
    });
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/companies" className="hover:text-blue-500 transition-colors">
          Companies
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-zinc-200 font-semibold">{company.name}</span>
      </nav>

      {/* Header */}
      <header className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-block rounded-full border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 px-3 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {company.industry || "Technology & Services"}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {company.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              {company.description ||
                "Placement experiences and interview questions reported by students."}
            </p>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{company.website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <BookmarkButton
              targetType="COMPANY"
              targetId={company.id}
              showLabel
            />
            <Link
              href={`/share?company=${encodeURIComponent(company.id)}`}
              className="rounded-full bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-md shadow-blue-600/25"
            >
              Add Experience
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-100 dark:border-zinc-800/80 text-xs">
          <div className="p-3 rounded-xl bg-stone-50/50 dark:bg-zinc-800/40 border border-stone-200/60 dark:border-zinc-700/50">
            <span className="text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold block text-[10px]">
              Experiences
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {company.approvedExperiencesCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50/50 dark:bg-zinc-800/40 border border-stone-200/60 dark:border-zinc-700/50">
            <span className="text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold block text-[10px]">
              Reported Roles
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {company.rolesCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50/50 dark:bg-zinc-800/40 border border-stone-200/60 dark:border-zinc-700/50">
            <span className="text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold block text-[10px]">
              Questions Bank
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {company.reportedQuestions.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50/50 dark:bg-zinc-800/40 border border-stone-200/60 dark:border-zinc-700/50">
            <span className="text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold block text-[10px]">
              Latest Hiring
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {company.latestYear || "N/A"}
            </span>
          </div>
        </div>
      </header>

      {/* Reported Process */}
      {uniqueRoundNames.length > 0 && (
        <section className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-stone-50/40 dark:bg-[#111317] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Reported Selection Process
            </h3>
            <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
              Student-Reported Pipeline
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-medium text-slate-800 dark:text-zinc-200">
            {uniqueRoundNames.map((r, i) => (
              <div key={r} className="flex items-center gap-2">
                <span className="rounded-xl bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 px-3 py-1.5 shadow-2xs font-semibold">
                  {i + 1}. {r}
                </span>
                {i < uniqueRoundNames.length - 1 && (
                  <span className="text-blue-500 dark:text-blue-400 font-bold">→</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reported Roles */}
      {company.roles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Reported Roles ({company.roles.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {company.roles.map((role) => (
              <Link
                key={role.id}
                href={`/experiences?company=${company.slug}&role=${role.slug}`}
                className="rounded-full border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500 hover:scale-105 transition-all shadow-2xs"
              >
                {role.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Frequently Reported Questions at this Company */}
      {company.reportedQuestions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-zinc-800/80 pb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Frequently Reported Questions at {company.name}
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
              {company.reportedQuestions.length} questions recorded
            </span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#121418] overflow-hidden shadow-xs">
            {company.reportedQuestions.map((q) => (
              <div
                key={q.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 dark:hover:bg-zinc-900/60 transition-colors"
              >
                <div className="space-y-1.5">
                  <Link
                    href={`/questions/${q.slug}`}
                    className="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-500 transition-colors leading-snug"
                  >
                    {q.text}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                    {q.topic && (
                      <span className="text-slate-700 dark:text-zinc-300 font-semibold bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-[11px]">
                        {q.topic.name}
                      </span>
                    )}
                    <span>•</span>
                    <span className="capitalize">{q.difficulty?.toLowerCase()}</span>
                    {q.roles.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-slate-600 dark:text-zinc-400">
                          Asked for: {q.roles.join(", ")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40 text-blue-700 dark:text-blue-400 px-3 py-1 text-xs font-mono font-semibold">
                    {q.frequencyInCompany} {q.frequencyInCompany === 1 ? "report" : "reports"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Approved Interview Experiences */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-stone-200 dark:border-zinc-800/80 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Interview Experiences ({company.experiences.length})
          </h2>
          <Link
            href={`/experiences?company=${company.slug}`}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            Filter experiences →
          </Link>
        </div>

        {company.experiences.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 py-6">
            No approved interview experiences reported yet for {company.name}.
          </p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#121418] overflow-hidden shadow-xs">
            {company.experiences.map((exp) => (
              <ExperienceRow
                key={exp.id}
                experience={{
                  id: exp.id,
                  slug: exp.slug,
                  company: { name: company.name, slug: company.slug },
                  role: exp.role,
                  interviewYear: exp.interviewYear,
                  placementType: exp.placementType,
                  result: exp.result,
                  overallExperience: exp.overallExperience,
                  isDemo: exp.isDemo,
                  rounds: exp.rounds,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
