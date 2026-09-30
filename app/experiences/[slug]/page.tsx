import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
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
  Eye,
  ExternalLink,
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
import { TableOfContents } from "@/components/table-of-contents";
import { UserAvatar } from "@/components/user-avatar";
import { AuthorExperienceActions } from "@/components/author-experience-actions";
import { ViewCounter } from "@/components/view-counter";
import { getCurrentUser } from "@/lib/auth";
import { PLACEMENT_STATUS_CONFIG } from "@/lib/profile-constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Per-request memoization to avoid duplicate queries between generateMetadata and Page
const getCachedExperience = cache(async (slug: string) => {
  return await getPublicExperienceBySlug(slug);
});

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const experience = await getCachedExperience(params.slug);

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
  const [experience, currentUser] = await Promise.all([
    getCachedExperience(params.slug),
    getCurrentUser(),
  ]);

  if (!experience) {
    notFound();
  }

  const isAuthor = !!(currentUser && experience.userId && currentUser.id === experience.userId);
  const isAdmin = currentUser?.role === "ADMIN";

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

  const sections: { id: string; label: string }[] = [];
  if (experience.rounds.length > 0) {
    sections.push({ id: "selection-process", label: "Selection Process" });
  }
  if (oaRound) {
    sections.push({ id: "online-assessment", label: "Online Assessment" });
  }
  if (techRounds.length > 0) {
    sections.push({ id: "technical-interview", label: "Technical Interview" });
  }
  if (hrRounds.length > 0) {
    sections.push({ id: "hr-interview", label: "HR Interview" });
  }
  sections.push({ id: "overall-experience", label: "Overall Experience" });
  if (experience.advice) {
    sections.push({ id: "advice-for-juniors", label: "Advice for Juniors" });
  }
  sections.push({ id: "result", label: "Final Result" });

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

      {/* Author / Admin Management Actions */}
      {(isAuthor || isAdmin) && (
        <div className="mb-6">
          <AuthorExperienceActions
            experienceId={experience.id}
            experienceTitle={`${experience.company.name} — ${experience.role.title} (${experience.interviewYear})`}
            isAuthor={isAuthor}
            isAdmin={isAdmin}
          />
        </div>
      )}

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

              {/* Verification Status Badge */}
              {experience.status === "APPROVED" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Verified
                </span>
              ) : experience.status === "PENDING" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Unverified
                </span>
              ) : null}
            </div>

            {experience.status === "PENDING" && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-300 flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                <span>
                  <strong>Unverified Submission:</strong> This interview experience was submitted by a student and is awaiting coordinator verification.
                </span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">
              {experience.role.title}
            </h1>

            {/* Sub-bar: Student-Reported label, Author Avatar & Outcome badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-zinc-800/80">
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
                <span className="rounded-md bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 font-medium text-slate-700 dark:text-zinc-300">
                  Student-reported
                </span>
                <span>•</span>
                {experience.isAnonymous ? (
                  <div className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                    <UserAvatar name="Anonymous" size="xs" />
                    <span>Anonymous Student</span>
                  </div>
                ) : (
                  <Link
                    href={`/profile/${experience.user?.id || ""}`}
                    className="inline-flex items-center gap-1.5 font-medium text-slate-900 dark:text-zinc-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group"
                  >
                    <UserAvatar
                      name={experience.user?.name || "Student"}
                      image={experience.user?.image}
                      size="xs"
                      className="ring-1 ring-zinc-700/50"
                    />
                    <span className="group-hover:underline underline-offset-2 font-semibold">
                      {experience.user?.name || "Student"}
                    </span>
                  </Link>
                )}

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

                {/* Real-time Unique Views Counter */}
                <span>•</span>
                <ViewCounter
                  targetType="EXPERIENCE"
                  targetId={experience.id}
                  initialViews={experience.viewsCount}
                  className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400 font-mono"
                  iconClassName="h-3.5 w-3.5 text-blue-400"
                />
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
                              className="rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-[#16181e] p-4 space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                                  {idx + 1}. {link.question.text}
                                </p>
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
                            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                              {idx + 1}. {link.question.text}
                            </p>
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
          {/* Contributor Profile Card */}
          {!experience.isAnonymous && experience.user ? (
            <div className="rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  Shared by Student
                </h4>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Eye className="h-3.5 w-3.5 text-blue-400" />
                  {experience.viewsCount} {experience.viewsCount === 1 ? "view" : "views"}
                </span>
              </div>

              <div className="flex items-start gap-3.5">
                <Link href={`/profile/${experience.user.id}`} className="shrink-0 group">
                  <UserAvatar
                    name={experience.user.name}
                    image={experience.user.image}
                    size="lg"
                    showRing={true}
                    className="group-hover:scale-105 transition-transform"
                  />
                </Link>
                <div className="space-y-1 min-w-0">
                  <Link
                    href={`/profile/${experience.user.id}`}
                    className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors block truncate"
                  >
                    {experience.user.name}
                  </Link>
                  {(experience.user.department || experience.department) && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {experience.user.department || experience.department}
                    </p>
                  )}
                  {(experience.user.graduationYear || experience.graduationYear) && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Class of {experience.user.graduationYear || experience.graduationYear}
                    </p>
                  )}
                </div>
              </div>

              {/* Placement Status Badge if available */}
              {experience.user.placementStatus && (
                <div>
                  {(() => {
                    const cfg =
                      PLACEMENT_STATUS_CONFIG[experience.user.placementStatus] ||
                      PLACEMENT_STATUS_CONFIG.PREPARING;
                    return (
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.textColor}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
                        <span>
                          {experience.user.placementStatus === "OFFER_ACCEPTED" &&
                          experience.user.placedCompany
                            ? `Offer • ${experience.user.placedCompany}`
                            : cfg.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Bio quote if available */}
              {experience.user.bio && (
                <p className="text-xs text-slate-600 dark:text-zinc-400 italic line-clamp-2 leading-relaxed border-l-2 border-blue-500/40 pl-2.5">
                  "{experience.user.bio}"
                </p>
              )}

              {/* Action: Link to full student profile */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-100 dark:border-zinc-800">
                <Link
                  href={`/profile/${experience.user.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <span>View Student Profile</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {experience.user.linkedinUrl && (
                  <a
                    href={experience.user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A66C2] hover:underline"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  Contributor
                </h4>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                  <Eye className="h-3.5 w-3.5 text-blue-400" />
                  {experience.viewsCount} {experience.viewsCount === 1 ? "view" : "views"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                    Anonymous Student
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {experience.department ? `${experience.department} • ` : ""}Class of{" "}
                    {experience.interviewYear}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Shared anonymously to protect candidate privacy while helping junior students
                prepare.
              </p>
            </div>
          )}

          {/* Interactive Table of Contents with smooth section transitions */}
          <TableOfContents
            sections={sections}
            company={{
              name: experience.company.name,
              slug: experience.company.slug,
              description: experience.company.description,
            }}
          />

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
