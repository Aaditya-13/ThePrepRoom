import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, CheckCircle2, FileText, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileHeaderClient } from "@/components/profile-header-client";
import { ProfileSubmissionsList } from "@/components/profile-submissions-list";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "My Profile & Submissions | ThePrepRoom",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  // Fetch all user experiences and metric counters in parallel
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

  const approvedCount = experiences.filter((e) => e.status === "APPROVED").length;
  const pendingCount = experiences.filter((e) => e.status === "PENDING").length;
  const draftsCount = experiences.filter((e) => e.status === "DRAFT").length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Modern Profile Header Card with Avatar & Edit Modal */}
      <ProfileHeaderClient user={user} bookmarksCount={bookmarksCount} />

      {/* User Contribution Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 shadow-xs hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Approved & Live</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2 block font-heading">
            {approvedCount}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 shadow-xs hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Under Review</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2 block font-heading">
            {pendingCount}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 shadow-xs hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Saved Drafts</span>
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-2 block font-heading">
            {draftsCount}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 shadow-xs hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Questions Contributed</span>
            <HelpCircle className="h-4 w-4 text-purple-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-2 block font-heading">
            {contributedQuestionsCount}
          </span>
        </div>
      </div>

      {/* Submissions List with Instant Client-Side Tab Filtering */}
      <ProfileSubmissionsList experiences={experiences} />
    </div>
  );
}
