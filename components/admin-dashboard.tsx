"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  AlertTriangle,
  Building2,
  Plus,
  HelpCircle,
  FileText,
  Shield,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { adminModerateExperienceAction } from "@/actions/experience";
import { updateReportStatusAction } from "@/actions/report";
import { createCompanyAction, createCompanyRoleAction } from "@/actions/admin";
import { formatDate } from "@/lib/utils";

interface AdminDashboardProps {
  pendingExperiences: any[];
  approvedExperiences: any[];
  reports: any[];
  companies: any[];
  stats: {
    totalApproved: number;
    totalPending: number;
    totalReports: number;
    totalQuestions: number;
    totalUsers: number;
  };
}

export function AdminDashboard({
  pendingExperiences,
  approvedExperiences,
  reports,
  companies,
  stats,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "reports" | "companies" | "all">("pending");
  const [isPending, startTransition] = useTransition();

  // Company creation form state
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("");
  const [newCompanyDesc, setNewCompanyDesc] = useState("");
  const [companyMessage, setCompanyMessage] = useState<string | null>(null);

  // Role creation form state
  const [targetCompanyId, setTargetCompanyId] = useState(companies[0]?.id || "");
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [roleMessage, setRoleMessage] = useState<string | null>(null);

  const handleModerate = (id: string, action: "APPROVE" | "REJECT" | "FEATURE" | "DELETE") => {
    if (action === "DELETE" && !confirm("Are you sure you want to delete this experience permanently?")) {
      return;
    }

    startTransition(async () => {
      await adminModerateExperienceAction(id, action);
    });
  };

  const handleReportAction = (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    startTransition(async () => {
      await updateReportStatusAction(reportId, status);
    });
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyMessage(null);
    startTransition(async () => {
      const res = await createCompanyAction({
        name: newCompanyName,
        industry: newCompanyIndustry,
        description: newCompanyDesc,
      });
      if (res?.error) {
        setCompanyMessage(`Error: ${res.error}`);
      } else {
        setCompanyMessage("Company created successfully!");
        setNewCompanyName("");
        setNewCompanyIndustry("");
        setNewCompanyDesc("");
      }
    });
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleMessage(null);
    startTransition(async () => {
      const res = await createCompanyRoleAction(targetCompanyId, newRoleTitle);
      if (res?.error) {
        setRoleMessage(`Error: ${res.error}`);
      } else {
        setRoleMessage("Role created successfully!");
        setNewRoleTitle("");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xs">
        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-4 shadow-xs">
          <span className="text-slate-500 dark:text-zinc-400 font-medium block">Pending Review</span>
          <span className="text-2xl font-bold text-amber-500 dark:text-amber-400 mt-1 block">
            {stats.totalPending}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-4 shadow-xs">
          <span className="text-slate-500 dark:text-zinc-400 font-medium block">Approved Live</span>
          <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 mt-1 block">
            {stats.totalApproved}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-4 shadow-xs">
          <span className="text-slate-500 dark:text-zinc-400 font-medium block">Open Reports</span>
          <span className="text-2xl font-bold text-rose-500 dark:text-rose-400 mt-1 block">
            {stats.totalReports}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-4 shadow-xs">
          <span className="text-slate-500 dark:text-zinc-400 font-medium block">Questions Bank</span>
          <span className="text-2xl font-bold text-blue-500 dark:text-blue-400 mt-1 block">
            {stats.totalQuestions}
          </span>
        </div>

        <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-4 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-slate-500 dark:text-zinc-400 font-medium block">Registered Users</span>
          <span className="text-2xl font-bold text-purple-500 dark:text-purple-400 mt-1 block">
            {stats.totalUsers}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "pending"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-stone-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Pending Queue ({pendingExperiences.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "reports"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-stone-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Reports Triage ({reports.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("companies")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "companies"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-stone-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Companies & Roles ({companies.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-stone-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
          }`}
        >
          Published Experiences ({approvedExperiences.length})
        </button>
      </div>

      {/* TAB 1: PENDING QUEUE */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            Submissions requiring placement coordinator approval before going public
          </div>

          {pendingExperiences.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-[#111317] p-8 space-y-2">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
              <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">Review Queue is Clear</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                All submitted student experiences have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-3xl border border-amber-500/30 bg-amber-500/5 dark:bg-[#16181e] p-6 sm:p-7 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-lg">
                          {exp.company.name} — {exp.role.title}
                        </span>
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          Pending Moderation
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        Submitted by: {exp.isAnonymous ? "Anonymous Student" : exp.user?.name || "Student"} ({exp.user?.email || "No email"}) · {formatDate(exp.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleModerate(exp.id, "APPROVE")}
                        disabled={isPending}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white inline-flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve & Publish</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleModerate(exp.id, "REJECT")}
                        disabled={isPending}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 inline-flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 bg-white dark:bg-[#111317] p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 space-y-3">
                    <p className="font-bold text-slate-900 dark:text-zinc-100">Overall Narrative:</p>
                    <p className="whitespace-pre-line leading-relaxed">{exp.overallExperience}</p>

                    {exp.advice && (
                      <div className="pt-3 border-t border-stone-100 dark:border-zinc-800/80">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block mb-1">Junior Advice:</span>
                        <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">{exp.advice}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REPORTS TRIAGE */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-[#111317] p-8 space-y-2">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
              <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">No Pending Reports</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                No experiences or questions currently flagged by students.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-5 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold px-2.5 py-0.5 text-[10px]">
                          {rep.reason}
                        </span>
                        <span className="text-slate-400 dark:text-zinc-600">•</span>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">
                          Target: {rep.experience ? `Experience (${rep.experience.company.name} - ${rep.experience.role.title})` : `Question: "${rep.question?.text}"`}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-zinc-400 mt-1">
                        Reported on {formatDate(rep.createdAt)} by {rep.reporter?.name || "Anonymous Student"}
                      </p>
                      {rep.details && (
                        <p className="text-slate-700 dark:text-zinc-300 bg-stone-50 dark:bg-[#16181e] p-3 rounded-xl mt-2 border border-stone-200 dark:border-zinc-800">
                          {rep.details}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReportAction(rep.id, "RESOLVED")}
                        disabled={isPending}
                        className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-500 transition-colors font-medium"
                      >
                        Mark Resolved
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReportAction(rep.id, "DISMISSED")}
                        disabled={isPending}
                        className="rounded-xl border border-stone-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800 px-3 py-1.5 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPANIES & ROLES */}
      {activeTab === "companies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Add Company */}
          <div className="rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 sm:p-7 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Add New Company
            </h3>
            {companyMessage && (
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{companyMessage}</p>
            )}
            <form onSubmit={handleCreateCompany} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  required
                  placeholder="e.g. Microsoft"
                  className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Industry</label>
                <input
                  type="text"
                  value={newCompanyIndustry}
                  onChange={(e) => setNewCompanyIndustry(e.target.value)}
                  placeholder="e.g. Software & Cloud"
                  className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCompanyDesc}
                  onChange={(e) => setNewCompanyDesc(e.target.value)}
                  placeholder="Brief overview of company..."
                  className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 font-semibold text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                Create Company
              </button>
            </form>
          </div>

          {/* Add Role to Company */}
          <div className="rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 sm:p-7 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Add Role to Company
            </h3>
            {roleMessage && (
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">{roleMessage}</p>
            )}
            <form onSubmit={handleCreateRole} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Select Company *</label>
                <select
                  value={targetCompanyId}
                  onChange={(e) => setTargetCompanyId(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Role Title *</label>
                <input
                  type="text"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  required
                  placeholder="e.g. Site Reliability Engineer"
                  className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 font-semibold text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                Add Role
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: PUBLISHED EXPERIENCES */}
      {activeTab === "all" && (
        <div className="space-y-3 text-xs">
          <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-white dark:bg-[#111317] overflow-hidden shadow-xs">
            {approvedExperiences.map((exp) => (
              <div
                key={exp.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-[#16181e] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-base">
                      {exp.company.name} — {exp.role.title}
                    </span>
                    {exp.isFeatured && (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-[10px] font-bold">
                        Featured
                      </span>
                    )}
                    {exp.isDemo && (
                      <span className="rounded-full bg-stone-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 text-[10px] font-medium">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400 mt-1">
                    Year {exp.interviewYear} · {exp.viewsCount} views · Created {formatDate(exp.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleModerate(exp.id, "FEATURE")}
                    disabled={isPending}
                    className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:border-amber-500 hover:text-amber-500 inline-flex items-center gap-1.5 transition-colors font-semibold"
                    title="Toggle featured status"
                  >
                    <Star className={`h-3.5 w-3.5 ${exp.isFeatured ? "fill-amber-400 text-amber-500" : "text-slate-400 dark:text-zinc-500"}`} />
                    <span>{exp.isFeatured ? "Unfeature" : "Feature"}</span>
                  </button>

                  <Link
                    href={`/experiences/${exp.slug}`}
                    target="_blank"
                    className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-500 inline-flex items-center gap-1.5 transition-colors font-semibold"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleModerate(exp.id, "DELETE")}
                    disabled={isPending}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
