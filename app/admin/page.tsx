import { redirect } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata = {
  title: "Admin Moderation",
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login?next=/admin");
  }

  // Fetch moderation queues
  const [
    pendingExperiences,
    approvedExperiences,
    reports,
    companies,
    totalApproved,
    totalPending,
    totalReports,
    totalQuestions,
    totalUsers,
  ] = await Promise.all([
    prisma.experience.findMany({
      where: { status: "PENDING" },
      include: { company: true, role: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.experience.findMany({
      where: { status: "APPROVED" },
      include: { company: true, role: true },
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
      include: { roles: true },
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
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-8 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-500 dark:text-blue-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Placement Officer Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
            Placement Knowledge Moderation
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Review student interview submissions, triage community report tickets, and manage approved company profiles and roles.
          </p>
        </div>
      </div>

      <AdminDashboard
        pendingExperiences={pendingExperiences}
        approvedExperiences={approvedExperiences}
        reports={reports}
        companies={companies}
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
