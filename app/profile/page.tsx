import Link from "next/link";
import { redirect } from "next/navigation";
import { User, FileText, Bookmark, Clock, CheckCircle2, Edit, ArrowRight, Sparkles, PlusCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "My Profile & Submissions",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  // Fetch all user experiences (including drafts, pending, and approved)
  const [experiences, bookmarksCount, contributedQuestionsCount] = await Promise.all([
    prisma.experience.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        company: true,
        role: true,
      },
    }),
    prisma.bookmark.count({
      where: { userId: user.id },
    }),
    prisma.experienceQuestion.count({
      where: {
        experience: { userId: user.id },
      },
    }),
  ]);

  const drafts = experiences.filter((e) => e.status === "DRAFT");
  const pending = experiences.filter((e) => e.status === "PENDING");
  const approved = experiences.filter((e) => e.status === "APPROVED");
  const rejected = experiences.filter((e) => e.status === "REJECTED");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">{user.name}</h1>
              {user.role === "ADMIN" && (
                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-zinc-300 pt-0.5 font-medium">
              {user.department && <span className="rounded-md bg-stone-100 dark:bg-zinc-800 px-2 py-0.5">{user.department}</span>}
              {user.graduationYear && <span className="rounded-md bg-stone-100 dark:bg-zinc-800 px-2 py-0.5">Class of {user.graduationYear}</span>}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href="/bookmarks"
            className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:border-blue-500/50 hover:text-blue-500 inline-flex items-center gap-2 transition-all shadow-xs"
          >
            <Bookmark className="h-4 w-4 text-blue-500" />
            <span>Bookmarks ({bookmarksCount})</span>
          </Link>
          <Link
            href="/share"
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 inline-flex items-center gap-1.5 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Share Experience</span>
          </Link>
        </div>
      </div>

      {/* User Contribution Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-5 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium block">Approved & Live</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-500 dark:text-emerald-400 mt-1 block">
            {approved.length}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-5 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium block">Under Review</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 dark:text-amber-400 mt-1 block">
            {pending.length}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-5 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium block">Saved Drafts</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-500 dark:text-blue-400 mt-1 block">
            {drafts.length}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-5 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium block">Questions Contributed</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-500 dark:text-purple-400 mt-1 block">
            {contributedQuestionsCount}
          </span>
        </div>
      </div>

      {/* Section: Saved Drafts (If any) */}
      {drafts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-zinc-800 pb-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              Work-in-Progress Drafts ({drafts.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Drafts are saved privately and not visible to others. Resume editing anytime to finish and submit for review.
          </p>

          <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#111317] overflow-hidden shadow-xs">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-[#16181e] transition-colors"
              >
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {d.company.name} — {d.role.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                    Saved on {formatDate(d.updatedAt)} · Interview Year {d.interviewYear}
                  </p>
                </div>
                <Link
                  href={`/share?draftId=${d.id}`}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white inline-flex items-center gap-1.5 shrink-0 transition-all shadow-sm active:scale-95"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Continue Editing</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section: Submissions Queue & History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
            All Submissions ({experiences.length})
          </h2>
        </div>

        {experiences.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-stone-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-[#111317] p-8 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-zinc-200">No submissions yet.</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Share your first interview experience to help juniors prepare with real, authentic insights.
            </p>
            <div className="pt-2">
              <Link
                href="/share"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all"
              >
                Share Experience
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#111317] overflow-hidden shadow-xs">
            {experiences.map((exp) => {
              let badgeColor = "bg-stone-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700";
              let statusLabel = exp.status;

              if (exp.status === "APPROVED") {
                badgeColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                statusLabel = "Approved & Live";
              } else if (exp.status === "PENDING") {
                badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                statusLabel = "Under Review";
              } else if (exp.status === "DRAFT") {
                badgeColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
                statusLabel = "Draft";
              } else if (exp.status === "REJECTED") {
                badgeColor = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                statusLabel = "Needs Changes";
              }

              return (
                <div
                  key={exp.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-[#16181e] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-base">
                        {exp.company.name} — {exp.role.title}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Placement Year {exp.interviewYear} · {exp.isAnonymous ? "Posted Anonymously" : "Named Submission"} · Updated {formatDate(exp.updatedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {exp.status === "APPROVED" && (
                      <Link
                        href={`/experiences/${exp.slug}`}
                        className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-3.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 hover:border-blue-500 hover:text-blue-500 inline-flex items-center gap-1.5 font-semibold transition-colors shadow-xs"
                      >
                        <span>View Live</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    {exp.status === "DRAFT" && (
                      <Link
                        href={`/share?draftId=${exp.id}`}
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs text-white inline-flex items-center gap-1.5 font-semibold transition-colors shadow-xs"
                      >
                        <span>Resume</span>
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
