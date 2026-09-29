import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin Command Center | ThePrepRoom",
};

export default async function AdminPage() {
  // Fetch moderation queues and catalog data in parallel
  const [
    pendingExperiences,
    approvedExperiences,
    reports,
    companies,
    questions,
    users,
    topics,
    totalApproved,
    totalPending,
    totalReports,
    totalQuestions,
    totalUsers,
  ] = await Promise.all([
    prisma.experience.findMany({
      where: { status: "PENDING" },
      include: { company: true, role: true, user: true, rounds: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.experience.findMany({
      where: { status: "APPROVED" },
      include: { company: true, role: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.findMany({
      where: { status: "PENDING" },
      include: {
        experience: { include: { company: true, role: true } },
        question: true,
        reporter: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.company.findMany({
      include: {
        roles: {
          include: {
            _count: { select: { experiences: true } },
          },
          orderBy: { title: "asc" },
        },
        _count: {
          select: { experiences: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.question.findMany({
      include: {
        topic: true,
        _count: { select: { experienceLinks: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
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
        createdAt: true,
        _count: { select: { experiences: true, bookmarks: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.topic.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.experience.count({ where: { status: "APPROVED" } }),
    prisma.experience.count({ where: { status: "PENDING" } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.question.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-400 font-bold block mb-1">
            Admin Command Center
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-[-0.03em] text-white">
            Placement Knowledge & System Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Full administrative control over companies, roles, questions bank, moderation queues, and student accounts.
          </p>
        </div>
      </div>

      <AdminDashboard
        pendingExperiences={pendingExperiences}
        approvedExperiences={approvedExperiences}
        reports={reports}
        companies={companies}
        questions={questions}
        users={users}
        topics={topics}
        stats={{
          totalApproved,
          totalPending,
          totalReports,
          totalQuestions,
          totalUsers,
        }}
      />
    </div>
  );
}
