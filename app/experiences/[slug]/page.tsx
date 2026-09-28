import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calendar,
  Clock,
  Laptop,
  CheckCircle,
  HelpCircle,
  Share2,
  User,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  getPublicExperienceBySlug,
  getRelatedExperiences,
} from "@/lib/public-queries";
import {
  formatDate,
  formatPlacementType,
  formatRoundType,
  formatResultStatus,
} from "@/lib/utils";
import { BookmarkButton } from "@/components/bookmark-button";
import { ReportModal } from "@/components/report-modal";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const experience = await getPublicExperienceBySlug(params.slug);

  if (!experience) {
    return { title: "Experience Not Found" };
  }

  return {
    title: `${experience.company.name} — ${experience.role.title} (${experience.interviewYear})`,
    description: `Placement interview experience for ${experience.role.title} at ${experience.company.name} (${experience.interviewYear}). Rounds, questions asked, and candidate advice.`,
  };
}

export default async function ExperienceDetailPage(props: PageProps) {
  const params = await props.params;
  const experience = await getPublicExperienceBySlug(params.slug);

  if (!experience) {
    notFound();
  }

  const related = await getRelatedExperiences(
    experience.id,
    experience.companyId,
    experience.roleId
  );

  const resultInfo = formatResultStatus(experience.result);

  // Group rounds by type for quick lookup
  const oaRound = experience.rounds.find((r) => r.roundType === "ONLINE_ASSESSMENT");
  const techRounds = experience.rounds.filter((r) => r.roundType === "TECHNICAL");
  const hrRounds = experience.rounds.filter((r) => r.roundType === "HR");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Modern Breadcrumbs */}
      <nav className="mb-8 flex items-center space-x-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
        <Link href="/" className="hover:text-blue-500 transition-colors">
          Home
        </Link>
        <span className="text-slate-300 dark:text-zinc-700">/</span>
        <Link href="/experiences" className="hover:text-blue-500 transition-colors">
          Experiences
        </Link>
        <span className="text-slate-300 dark:text-zinc-700">/</span>
        <Link
          href={`/companies/${experience.company.slug}`}
          className="hover:text-blue-500 transition-colors"
        >
          {experience.company.name}
        </Link>
        <span className="text-slate-300 dark:text-zinc-700">/</span>
        <span className="text-slate-800 dark:text-zinc-200 truncate max-w-xs font-semibold">
          {experience.role.title} ({experience.interviewYear})
        </span>
      </nav>

      {/* Main Experience Article Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Content (8 cols on desktop) */}
        <article className="lg:col-span-8 space-y-10">
          {/* Header Card */}
          <header className="rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/companies/${experience.company.slug}`}
                className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                {experience.company.name}
              </Link>
              <span className="rounded-full border border-stone-200 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-zinc-400">
                {experience.interviewYear} · {formatPlacementType(experience.placementType)}
              </span>

              {/* Sample/Demo Badge */}
              {experience.isDemo && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  Sample / Demo Experience
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
              {experience.role.title}
            </h1>

            {/* Sub-bar: Student-Reported label & Outcome badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-zinc-800/80">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <span className="rounded-md bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 font-medium text-slate-700 dark:text-zinc-300">
                  Student-reported
                </span>
                <span>•</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200">
                  {experience.isAnonymous
                    ? "Anonymous Student"
                    : experience.user?.name || "Student"}
                </span>
                {experience.department && (
                  <>
                    <span>•</span>
                    <span>{experience.department}</span>
                  </>
                )}
                {experience.graduationYear && (
                  <>
                    <span>•</span>
                    <span>Class of {experience.graduationYear}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${resultInfo.badgeClass}`}
                >
                  {resultInfo.label}
                </span>
                <BookmarkButton
                  targetType="EXPERIENCE"
                  targetId={experience.id}
                  showLabel
                />
              </div>
            </div>
          </header>

          {/* Section: Selection Process */}
          {experience.rounds.length > 0 && (
            <section id="selection-process" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Laptop className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                    Selection Process
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Sequence of evaluation rounds reported by the candidate.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-5 sm:p-6 divide-y divide-stone-100 dark:divide-zinc-800/80 shadow-xs">
                {experience.rounds.map((round, idx) => (
                  <div
                    key={round.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-start gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-500/30">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                          {round.roundName || formatRoundType(round.roundType)}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
                          {round.durationMinutes && (
                            <span className="rounded-md bg-stone-100 dark:bg-zinc-800 px-2 py-0.5">
                              {round.durationMinutes} mins
                            </span>
                          )}
                          {round.difficulty && (
                            <span className="rounded-md border border-stone-200 dark:border-zinc-800 px-2 py-0.5 capitalize">
                              {round.difficulty.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      {round.platform && (
                        <p className="text-xs text-slate-600 dark:text-zinc-400">
                          Platform: <span className="font-semibold text-slate-800 dark:text-zinc-200">{round.platform}</span>
                        </p>
                      )}
                      {round.description && (
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed pt-1">
                          {round.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Online Assessment */}
          {oaRound && (
            <section id="online-assessment" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Laptop className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                  Online Assessment (OA) Breakdown
                </h2>
              </div>

              <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-stone-50/50 dark:bg-[#16181e] p-6 space-y-4 shadow-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#111317] p-3.5">
                    <span className="text-slate-500 dark:text-zinc-400 block mb-1">Testing Platform</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                      {oaRound.platform || "Not specified"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#111317] p-3.5">
                    <span className="text-slate-500 dark:text-zinc-400 block mb-1">Total Duration</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                      {oaRound.durationMinutes ? `${oaRound.durationMinutes} minutes` : "Not reported"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#111317] p-3.5">
                    <span className="text-slate-500 dark:text-zinc-400 block mb-1">Estimated Difficulty</span>
                    <span className="font-bold text-amber-500 dark:text-amber-400 capitalize text-sm">
                      {oaRound.difficulty ? oaRound.difficulty.toLowerCase() : "Moderate"}
                    </span>
                  </div>
                </div>

                {oaRound.sections && (
                  <div className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#111317] p-4 text-xs space-y-1">
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block uppercase tracking-wider text-[11px]">
                      Test Sections:
                    </span>
                    <p className="font-mono text-slate-700 dark:text-zinc-300">{oaRound.sections}</p>
                  </div>
                )}

                {oaRound.description && (
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed pt-1">
                    {oaRound.description}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Section: Technical Interview */}
          {techRounds.length > 0 && (
            <section id="technical-interview" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                  Technical Interview Rounds
                </h2>
              </div>

              {techRounds.map((tech) => {
                const roundQuestions = experience.questionLinks.filter(
                  (link) => link.interviewRoundId === tech.id
                );

                return (
                  <div key={tech.id} className="space-y-4 rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800/80 pb-3">
                      <span className="text-base font-bold text-slate-900 dark:text-zinc-100">{tech.roundName}</span>
                      {tech.durationMinutes && (
                        <span className="rounded-full bg-stone-100 dark:bg-zinc-800 px-3 py-0.5 text-xs font-mono text-slate-600 dark:text-zinc-400">
                          {tech.durationMinutes} mins
                        </span>
                      )}
                    </div>

                    {tech.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 italic">
                        "{tech.description}"
                      </p>
                    )}

                    {roundQuestions.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          Questions Asked in this Round:
                        </h4>
                        <div className="space-y-3">
                          {roundQuestions.map((link, idx) => (
                            <div
                              key={link.id}
                              className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-[#16181e] p-4 space-y-2.5 hover:border-blue-500/50 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <Link
                                  href={`/questions/${link.question.slug}`}
                                  className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors leading-snug"
                                >
                                  {idx + 1}. {link.question.text}
                                </Link>
                                {link.question.topic && (
                                  <span className="shrink-0 rounded-full border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-zinc-300">
                                    {link.question.topic.name}
                                  </span>
                                )}
                              </div>

                              {link.studentNotes && (
                                <div className="rounded-lg bg-white dark:bg-[#111317] border border-stone-200/80 dark:border-zinc-800/80 p-3 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                                  <span className="font-bold text-blue-600 dark:text-blue-400 block text-[11px] uppercase tracking-wider mb-0.5">
                                    Candidate note:
                                  </span>
                                  {link.studentNotes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* Section: HR Interview */}
          {hrRounds.length > 0 && (
            <section id="hr-interview" className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                  HR & Behavioral Interview
                </h2>
              </div>

              {hrRounds.map((hr) => {
                const hrQuestions = experience.questionLinks.filter(
                  (link) => link.interviewRoundId === hr.id
                );

                return (
                  <div key={hr.id} className="space-y-4 rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 shadow-xs">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {hr.description || "General HR interaction focusing on culture fit, communication, and relocation."}
                    </p>

                    {hrQuestions.length > 0 && (
                      <div className="space-y-2.5 pt-2">
                        {hrQuestions.map((link, idx) => (
                          <div
                            key={link.id}
                            className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-[#16181e] p-4 space-y-1.5"
                          >
                            <Link
                              href={`/questions/${link.question.slug}`}
                              className="text-sm font-semibold text-slate-900 dark:text-zinc-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                            >
                              {idx + 1}. {link.question.text}
                            </Link>
                            {link.studentNotes && (
                              <p className="text-xs text-slate-600 dark:text-zinc-400 pl-3 border-l-2 border-amber-500">
                                {link.studentNotes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {/* Section: Overall Experience */}
          <section id="overall-experience" className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Overall Experience & Takeaways
            </h2>
            <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 sm:p-8 text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line shadow-xs font-normal">
              {experience.overallExperience}
            </div>
          </section>

          {/* Section: Advice for Juniors */}
          {experience.advice && (
            <section id="advice-for-juniors" className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Advice for Juniors
              </h2>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-[#111317] p-6 sm:p-8 text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  {experience.advice}
                </div>
              </div>
            </section>
          )}

          {/* Final Result Statement */}
          <section id="result" className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block">
                Final Result
              </span>
              <p className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                {resultInfo.label}
              </p>
            </div>
            <span
              className={`rounded-full border px-4 py-1 text-xs font-bold ${resultInfo.badgeClass}`}
            >
              {resultInfo.label}
            </span>
          </section>

          {/* Report Content Trigger */}
          <div className="pt-4 flex items-center justify-between text-xs text-slate-400 dark:text-zinc-500 border-t border-stone-200 dark:border-zinc-800">
            <span>Submitted on {formatDate(experience.createdAt)}</span>
            <ReportModal
              experienceId={experience.id}
              targetTitle={`${experience.company.name} — ${experience.role.title}`}
            />
          </div>
        </article>

        {/* Right Sticky Sidebar (4 cols on desktop) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Table of Contents */}
          <div className="sticky top-24 rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 space-y-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 border-b border-stone-100 dark:border-zinc-800 pb-2">
              On This Page
            </h3>
            <nav className="space-y-2 text-xs font-medium text-slate-600 dark:text-zinc-400">
              {experience.rounds.length > 0 && (
                <a
                  href="#selection-process"
                  className="block hover:text-blue-500 transition-colors py-0.5"
                >
                  1. Selection Process
                </a>
              )}
              {oaRound && (
                <a
                  href="#online-assessment"
                  className="block hover:text-blue-500 transition-colors py-0.5"
                >
                  2. Online Assessment
                </a>
              )}
              {techRounds.length > 0 && (
                <a
                  href="#technical-interview"
                  className="block hover:text-blue-500 transition-colors py-0.5"
                >
                  3. Technical Interview
                </a>
              )}
              {hrRounds.length > 0 && (
                <a
                  href="#hr-interview"
                  className="block hover:text-blue-500 transition-colors py-0.5"
                >
                  4. HR Interview
                </a>
              )}
              <a
                href="#overall-experience"
                className="block hover:text-blue-500 transition-colors py-0.5"
              >
                5. Overall Experience
              </a>
              {experience.advice && (
                <a
                  href="#advice-for-juniors"
                  className="block hover:text-blue-500 transition-colors py-0.5"
                >
                  6. Advice for Juniors
                </a>
              )}
              <a
                href="#result"
                className="block hover:text-blue-500 transition-colors py-0.5"
              >
                7. Final Result
              </a>
            </nav>

            {/* Company snapshot */}
            <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                About {experience.company.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {experience.company.description || "Leading global technology enterprise."}
              </p>
              <Link
                href={`/companies/${experience.company.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 pt-1"
              >
                <span>View all company experiences</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Related Experiences */}
          {related.length > 0 && (
            <div className="rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 border-b border-stone-100 dark:border-zinc-800 pb-2">
                Related Experiences
              </h4>
              <div className="divide-y divide-stone-100 dark:divide-zinc-800">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/experiences/${rel.slug}`}
                    className="block py-3 hover:text-blue-500 transition-colors group"
                  >
                    <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 group-hover:text-blue-500 transition-colors">
                      {rel.company.name} — {rel.role.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                      {rel.interviewYear} · {rel.rounds.length} rounds reported
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
