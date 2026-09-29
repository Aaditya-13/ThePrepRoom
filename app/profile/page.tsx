import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, Edit, ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ProfileHeaderClient } from "@/components/profile-header-client";

export const metadata = {
  title: "My Profile & Submissions | ThePrepRoom",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  // Fetch all user experiences and metric counters
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
      {/* Modern Profile Header Card with Edit Modal */}
      <ProfileHeaderClient user={user} bookmarksCount={bookmarksCount} />

      {/* User Contribution Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#111317] p-5 shadow-xs">
          <span className="text-xs text-zinc-400 font-medium block">Approved & Live</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 block font-heading">
            {approved.length}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111317] p-5 shadow-xs">
          <span className="text-xs text-zinc-400 font-medium block">Under Review</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 block font-heading">
            {pending.length}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111317] p-5 shadow-xs">
          <span className="text-xs text-zinc-400 font-medium block">Saved Drafts</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1 block font-heading">
            {drafts.length}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-[#111317] p-5 shadow-xs">
          <span className="text-xs text-zinc-400 font-medium block">Questions Contributed</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-1 block font-heading">
            {contributedQuestionsCount}
          </span>
        </div>
      </div>

      {/* Section: Saved Drafts (If any) */}
      {drafts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Clock className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              Work-in-Progress Drafts ({drafts.length})
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Drafts are saved privately and not visible to others. Resume editing anytime to finish and submit for review.
          </p>

          <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-2xl bg-[#111317] overflow-hidden shadow-xs">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#16181e] transition-colors"
              >
                <div>
                  <h4 className="text-base font-bold text-white">
                    {d.company.name} — {d.role.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
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
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 className="text-lg font-bold text-white font-heading">
            All Submissions ({experiences.length})
          </h2>
        </div>

        {experiences.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-3xl bg-[#111317] p-8 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-base font-bold text-zinc-200">No submissions yet.</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Share your first interview experience to help juniors prepare with real, authentic insights.
            </p>
            <div className="pt-2">
              <Link
                href="/share"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all active:scale-95"
              >
                Share Experience
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-2xl bg-[#111317] overflow-hidden shadow-xs">
            {experiences.map((exp) => {
              let badgeColor = "bg-zinc-800 text-zinc-300 border-zinc-700";
              let statusLabel = exp.status;

              if (exp.status === "APPROVED") {
                badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                statusLabel = "Approved & Live";
              } else if (exp.status === "PENDING") {
                badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                statusLabel = "Under Review";
              } else if (exp.status === "DRAFT") {
                badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                statusLabel = "Draft";
              } else if (exp.status === "REJECTED") {
                badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                statusLabel = "Needs Changes";
              }

              return (
                <div
                  key={exp.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#16181e] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">
                        {exp.company.name} — {exp.role.title}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Placement Year {exp.interviewYear} · {exp.isAnonymous ? "Posted Anonymously" : "Named Submission"} · Updated {formatDate(exp.updatedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {exp.status === "APPROVED" && (
                      <Link
                        href={`/experiences/${exp.slug}`}
                        className="rounded-xl border border-zinc-700 bg-[#16181e] px-3.5 py-1.5 text-xs text-zinc-200 hover:border-blue-500 hover:text-blue-400 inline-flex items-center gap-1.5 font-semibold transition-colors shadow-xs"
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
