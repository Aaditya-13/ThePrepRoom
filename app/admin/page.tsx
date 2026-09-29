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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Placement Knowledge Moderation
        </h1>
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
