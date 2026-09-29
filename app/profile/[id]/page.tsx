import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  User,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { UserAvatar } from "@/components/user-avatar";
import { PLACEMENT_STATUS_CONFIG } from "@/lib/profile-constants";
import { ExperienceRow } from "@/components/experience-row";
import { ProfileHeaderClient } from "@/components/profile-header-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const student = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true, department: true },
  });

  if (!student) {
    return { title: "Student Profile Not Found | ThePrepRoom" };
  }

  return {
    title: `${student.name} — Student Profile | ThePrepRoom`,
    description: `Placement interview experiences and campus insights contributed by ${student.name}.`,
  };
}

export default async function StudentPublicProfilePage(props: PageProps) {
  const params = await props.params;
  const [student, currentUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        department: true,
        graduationYear: true,
        placementStatus: true,
        placedCompany: true,
        linkedinUrl: true,
        bio: true,
        createdAt: true,
      },
    }),
    getCurrentUser(),
  ]);

  if (!student) {
    notFound();
  }

  const isSelf = currentUser?.id === student.id;

  // Fetch experiences contributed by this student
  const [experiences, bookmarksCount, questionsContributedCount] = await Promise.all([
    prisma.experience.findMany({
      where: {
        userId: student.id,
        status: isSelf ? { in: ["APPROVED", "PENDING", "DRAFT"] } : { in: ["APPROVED", "PENDING"] },
        ...(isSelf ? {} : { isAnonymous: false }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { name: true, slug: true } },
        role: { select: { title: true, slug: true } },
        rounds: { select: { roundType: true, roundName: true } },
      },
    }),
    isSelf
      ? prisma.bookmark.count({ where: { userId: student.id } })
      : Promise.resolve(0),
    prisma.experienceQuestion.count({
      where: {
        experience: {
          userId: student.id,
          status: isSelf ? { in: ["APPROVED", "PENDING", "DRAFT"] } : { in: ["APPROVED", "PENDING"] },
          ...(isSelf ? {} : { isAnonymous: false }),
        },
      },
    }),
  ]);

  const totalViews = experiences.reduce((acc, exp) => acc + (exp.viewsCount || 0), 0);
  const verifiedCount = experiences.filter((e) => e.status === "APPROVED").length;
  const pendingCount = experiences.filter((e) => e.status === "PENDING").length;

  const statusKey = student.placementStatus || "PREPARING";
  const statusConfig = PLACEMENT_STATUS_CONFIG[statusKey] || PLACEMENT_STATUS_CONFIG.PREPARING;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Modern Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
        <Link href="/" className="hover:text-blue-400 transition-colors">
          Home
        </Link>
        <span className="text-zinc-600">/</span>
        <Link href="/experiences" className="hover:text-blue-400 transition-colors">
          Experiences
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-200 font-semibold">{student.name}</span>
      </nav>

      {/* Header Profile Section */}
      {isSelf ? (
        <ProfileHeaderClient user={student} bookmarksCount={bookmarksCount} />
      ) : (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-[#111317] p-6 sm:p-8 shadow-xl shadow-black/40 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar with Status Dot */}
              <UserAvatar
                name={student.name}
                image={student.image}
                size="2xl"
                statusDotColor={statusConfig.dotColor}
                showRing={true}
              />

              {/* Student Identity & Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
                    {student.name}
                  </h1>
                  {student.role === "ADMIN" && (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Admin
                    </span>
                  )}

                  {/* Placement Journey Status Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.badgeBg} ${statusConfig.badgeBorder} ${statusConfig.textColor}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
                    <span>
                      {statusKey === "OFFER_ACCEPTED" && student.placedCompany
                        ? `Offer Secured • ${student.placedCompany}`
                        : statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Department, Year & LinkedIn Links */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {student.department && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#0c0d10] px-3 py-1 text-xs font-medium text-zinc-300">
                      <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{student.department}</span>
                    </span>
                  )}

                  {student.graduationYear && (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#0c0d10] px-3 py-1 text-xs font-medium text-zinc-300">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Class of {student.graduationYear}</span>
                    </span>
                  )}

                  {student.linkedinUrl && (
                    <a
                      href={student.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 px-3 py-1 text-xs font-semibold text-[#0A66C2] transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="#0A66C2">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Bio snippet */}
                {student.bio && (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pt-2 max-w-2xl border-t border-zinc-800/80 mt-2">
                    "{student.bio}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 shadow-xs hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Experiences Shared</span>
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-white mt-2 block font-heading">
            {experiences.length}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 shadow-xs hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Verified by Admin</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2 block font-heading">
            {verifiedCount}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 shadow-xs hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Views</span>
            <Eye className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-2 block font-heading">
            {totalViews}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 shadow-xs hover:border-zinc-700/80 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Questions Contributed</span>
            <HelpCircle className="h-4 w-4 text-purple-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-2 block font-heading">
            {questionsContributedCount}
          </span>
        </div>
      </div>

      {/* Contributed Experiences List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-heading">
              Interview Experiences by {student.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Direct campus recruitment reports and interview questions shared to guide peers.
            </p>
          </div>
          <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
            {experiences.length} {experiences.length === 1 ? "Experience" : "Experiences"}
          </span>
        </div>

        {experiences.length > 0 ? (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <ExperienceRow
                key={exp.id}
                experience={{
                  id: exp.id,
                  slug: exp.slug,
                  status: exp.status,
                  viewsCount: exp.viewsCount,
                  company: exp.company,
                  role: exp.role,
                  interviewYear: exp.interviewYear,
                  placementType: exp.placementType,
                  result: exp.result,
                  overallExperience: exp.overallExperience,
                  rounds: exp.rounds.map((r) => ({
                    roundType: r.roundType,
                    roundName: r.roundName || undefined,
                  })),
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111317] p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/80 text-zinc-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-200">No Experiences Published Yet</h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              {student.name} hasn't shared any public placement interview experiences yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
