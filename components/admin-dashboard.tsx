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
  Users,
  Search,
  CheckCircle2,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  UserX,
} from "lucide-react";
import { adminModerateExperienceAction } from "@/actions/experience";
import { updateReportStatusAction } from "@/actions/report";
import {
  createCompanyAction,
  deleteCompanyAction,
  createCompanyRoleAction,
  deleteCompanyRoleAction,
  updateUserRoleAction,
  createQuestionAction,
  deleteQuestionAction,
} from "@/actions/admin";
import { formatDate, formatPlacementType } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { PLACEMENT_STATUS_CONFIG } from "@/lib/profile-constants";

interface AdminDashboardProps {
  pendingExperiences: any[];
  approvedExperiences: any[];
  reports: any[];
  companies: any[];
  questions: any[];
  users: any[];
  topics: any[];
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
  companies: initialCompanies,
  questions: initialQuestions,
  users: initialUsers,
  topics,
  stats,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "pending" | "companies" | "questions" | "users" | "reports" | "all"
  >("pending");
  const [isPending, startTransition] = useTransition();

  // Search filters
  const [companySearch, setCompanySearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Company creation form state
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("");
  const [newCompanyWebsite, setNewCompanyWebsite] = useState("");
  const [newCompanyDesc, setNewCompanyDesc] = useState("");
  const [companyMessage, setCompanyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Role creation form state
  const [targetCompanyId, setTargetCompanyId] = useState(initialCompanies[0]?.id || "");
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [roleMessage, setRoleMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Inline role creation per company card
  const [inlineRoleCompanyId, setInlineRoleCompanyId] = useState<string | null>(null);
  const [inlineRoleTitle, setInlineRoleTitle] = useState("");

  // Question creation form state
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionTopicId, setNewQuestionTopicId] = useState(topics[0]?.id || "");
  const [newQuestionRound, setNewQuestionRound] = useState("TECHNICAL");
  const [newQuestionDifficulty, setNewQuestionDifficulty] = useState("MEDIUM");
  const [questionMessage, setQuestionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Global action feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleModerate = (id: string, action: "APPROVE" | "REJECT" | "FEATURE" | "DELETE") => {
    if (action === "DELETE" && !confirm("Are you sure you want to permanently delete this experience?")) {
      return;
    }
    startTransition(async () => {
      const res = await adminModerateExperienceAction(id, action);
      if (res?.success) {
        showFeedback(`Experience ${action.toLowerCase()}d successfully.`);
      }
    });
  };

  const handleReportAction = (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    startTransition(async () => {
      await updateReportStatusAction(reportId, status);
      showFeedback(`Report marked as ${status.toLowerCase()}.`);
    });
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyMessage(null);
    startTransition(async () => {
      const res = await createCompanyAction({
        name: newCompanyName,
        industry: newCompanyIndustry,
        website: newCompanyWebsite,
        description: newCompanyDesc,
      });
      if (res?.error) {
        setCompanyMessage({ type: "error", text: res.error });
      } else {
        setCompanyMessage({ type: "success", text: `Company "${newCompanyName}" created successfully!` });
        setNewCompanyName("");
        setNewCompanyIndustry("");
        setNewCompanyWebsite("");
        setNewCompanyDesc("");
      }
    });
  };

  const handleDeleteCompany = (companyId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete company "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteCompanyAction(companyId);
      if (res?.error) {
        showFeedback(res.error, "error");
      } else {
        showFeedback(`Company "${name}" deleted.`);
      }
    });
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    setRoleMessage(null);
    startTransition(async () => {
      const res = await createCompanyRoleAction(targetCompanyId, newRoleTitle);
      if (res?.error) {
        setRoleMessage({ type: "error", text: res.error });
      } else {
        setRoleMessage({ type: "success", text: `Role "${newRoleTitle}" added successfully!` });
        setNewRoleTitle("");
      }
    });
  };

  const handleInlineCreateRole = (companyId: string) => {
    if (!inlineRoleTitle.trim()) return;
    startTransition(async () => {
      const res = await createCompanyRoleAction(companyId, inlineRoleTitle);
      if (res?.error) {
        showFeedback(res.error, "error");
      } else {
        showFeedback(`Role "${inlineRoleTitle}" added!`);
        setInlineRoleTitle("");
        setInlineRoleCompanyId(null);
      }
    });
  };

  const handleDeleteRole = (roleId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete role "${title}"?`)) return;
    startTransition(async () => {
      const res = await deleteCompanyRoleAction(roleId);
      if (res?.error) {
        showFeedback(res.error, "error");
      } else {
        showFeedback(`Role "${title}" removed.`);
      }
    });
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionMessage(null);
    startTransition(async () => {
      const res = await createQuestionAction({
        text: newQuestionText,
        topicId: newQuestionTopicId,
        round: newQuestionRound,
        difficulty: newQuestionDifficulty,
      });
      if (res?.error) {
        setQuestionMessage({ type: "error", text: res.error });
      } else {
        setQuestionMessage({ type: "success", text: "Question added to Question Bank!" });
        setNewQuestionText("");
      }
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    startTransition(async () => {
      const res = await deleteQuestionAction(questionId);
      if (res?.error) {
        showFeedback(res.error, "error");
      } else {
        showFeedback("Question deleted from bank.");
      }
    });
  };

  const handleToggleUserRole = (userId: string, currentRole: string, userName: string) => {
    const newRole = currentRole === "ADMIN" ? "STUDENT" : "ADMIN";
    const msg =
      newRole === "ADMIN"
        ? `Grant Admin privileges to ${userName}?`
        : `Revoke Admin privileges from ${userName}?`;
    if (!confirm(msg)) return;

    startTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole);
      if (res?.error) {
        showFeedback(res.error, "error");
      } else {
        showFeedback(`${userName}'s role updated to ${newRole}.`);
      }
    });
  };

  // Filtered lists
  const filteredCompanies = initialCompanies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
    c.industry?.toLowerCase().includes(companySearch.toLowerCase())
  );

  const filteredQuestions = initialQuestions.filter((q) =>
    q.text.toLowerCase().includes(questionSearch.toLowerCase()) ||
    q.topic?.name.toLowerCase().includes(questionSearch.toLowerCase())
  );

  const filteredUsers = initialUsers.filter((u) =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.department?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`rounded-2xl p-4 text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/15 border border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Action Control Bar */}
      <div className="rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-[#111317] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Admin Management Tools
              </h2>
              <p className="text-xs text-zinc-400">
                Directly add companies, define interview roles, manage questions, and oversee student accounts.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("companies")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>+ Add Company</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("companies")}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
          >
            <Briefcase className="h-3.5 w-3.5 text-blue-400" />
            <span>+ Add Role</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
          >
            <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
            <span>+ Add Question</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700/80 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all active:scale-95"
          >
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <span>Manage Users ({stats.totalUsers})</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Clickable Tabs) */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            activeTab === "pending"
              ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10"
              : "border-zinc-800/80 bg-[#111317] hover:border-zinc-700"
          }`}
        >
          <span className="text-zinc-400 font-medium block">Pending Review</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block font-heading">
            {stats.totalPending}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            activeTab === "all"
              ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
              : "border-zinc-800/80 bg-[#111317] hover:border-zinc-700"
          }`}
        >
          <span className="text-zinc-400 font-medium block">Verified Live</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block font-heading">
            {stats.totalApproved}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("companies")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            activeTab === "companies"
              ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
              : "border-zinc-800/80 bg-[#111317] hover:border-zinc-700"
          }`}
        >
          <span className="text-zinc-400 font-medium block">Companies & Roles</span>
          <span className="text-2xl font-black text-blue-400 mt-1 block font-heading">
            {initialCompanies.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            activeTab === "questions"
              ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/10"
              : "border-zinc-800/80 bg-[#111317] hover:border-zinc-700"
          }`}
        >
          <span className="text-zinc-400 font-medium block">Questions Bank</span>
          <span className="text-2xl font-black text-purple-400 mt-1 block font-heading">
            {stats.totalQuestions}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            activeTab === "users"
              ? "border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
              : "border-zinc-800/80 bg-[#111317] hover:border-zinc-700"
          }`}
        >
          <span className="text-zinc-400 font-medium block">Registered Users</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block font-heading">
            {stats.totalUsers}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            activeTab === "reports"
              ? "border-rose-500/50 bg-rose-500/10 shadow-lg shadow-rose-500/10"
              : "border-zinc-800/80 bg-[#111317] hover:border-zinc-700"
          }`}
        >
          <span className="text-zinc-400 font-medium block">Open Reports</span>
          <span className="text-2xl font-black text-rose-400 mt-1 block font-heading">
            {stats.totalReports}
          </span>
        </button>
      </div>

      {/* Tab Navigation Buttons */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "pending"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-zinc-800/80 text-zinc-400 hover:text-white"
          }`}
        >
          Pending Queue ({pendingExperiences.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("companies")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "companies"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-zinc-800/80 text-zinc-400 hover:text-white"
          }`}
        >
          Companies & Roles ({initialCompanies.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "questions"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-zinc-800/80 text-zinc-400 hover:text-white"
          }`}
        >
          Questions Bank ({initialQuestions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "users"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-zinc-800/80 text-zinc-400 hover:text-white"
          }`}
        >
          Registered Users ({initialUsers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-zinc-800/80 text-zinc-400 hover:text-white"
          }`}
        >
          Verified Experiences ({approvedExperiences.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "reports"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "bg-zinc-800/80 text-zinc-400 hover:text-white"
          }`}
        >
          Reports Triage ({reports.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PENDING QUEUE */}
      {/* ========================================================= */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          <div className="text-xs text-zinc-400">
            Unverified student submissions awaiting coordinator review. Once verified, they update to a green Verified badge across the system.
          </div>

          {pendingExperiences.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-3xl bg-[#111317] p-8 space-y-2">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
              <h4 className="text-base font-bold text-white">Review Queue is Clear</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                All submitted student experiences have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-7 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-lg">
                          {exp.company.name} — {exp.role.title}
                        </span>
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                          Unverified (Live)
                        </span>
                        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] text-zinc-400">
                          {exp.interviewYear} · {formatPlacementType(exp.placementType)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Submitted by:{" "}
                        <strong className="text-zinc-200">
                          {exp.isAnonymous ? "Anonymous Student" : exp.user?.name || "Student"}
                        </strong>{" "}
                        ({exp.user?.email || "No email"}) · {formatDate(exp.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleModerate(exp.id, "APPROVE")}
                        disabled={isPending}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white inline-flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Verify Experience</span>
                      </button>

                      <Link
                        href={`/experiences/${exp.slug}`}
                        target="_blank"
                        className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:border-blue-500 hover:text-blue-400 inline-flex items-center gap-1.5 transition-all"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleModerate(exp.id, "REJECT")}
                        disabled={isPending}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 inline-flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-zinc-300 bg-[#111317] p-5 rounded-2xl border border-zinc-800 space-y-3">
                    <p className="font-bold text-white">Overall Narrative:</p>
                    <p className="whitespace-pre-line leading-relaxed">{exp.overallExperience}</p>

                    {exp.advice && (
                      <div className="pt-3 border-t border-zinc-800">
                        <span className="font-bold text-white block mb-1">Junior Advice:</span>
                        <p className="text-zinc-400 leading-relaxed">{exp.advice}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: COMPANIES & ROLES MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === "companies" && (
        <div className="space-y-8">
          {/* Creation Forms Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            {/* Add Company Card */}
            <div className="lg:col-span-6 rounded-3xl border border-zinc-800/90 bg-[#111317] p-6 sm:p-7 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Building2 className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Add New Company</h3>
              </div>

              {companyMessage && (
                <p
                  className={`text-xs font-semibold ${
                    companyMessage.type === "success" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {companyMessage.text}
                </p>
              )}

              <form onSubmit={handleCreateCompany} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    required
                    placeholder="e.g. Google, Microsoft, Morgan Stanley"
                    className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Industry</label>
                    <input
                      type="text"
                      value={newCompanyIndustry}
                      onChange={(e) => setNewCompanyIndustry(e.target.value)}
                      placeholder="e.g. Technology / Cloud"
                      className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-300 mb-1">Website URL</label>
                    <input
                      type="text"
                      value={newCompanyWebsite}
                      onChange={(e) => setNewCompanyWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newCompanyDesc}
                    onChange={(e) => setNewCompanyDesc(e.target.value)}
                    placeholder="Brief background about company recruitment drives..."
                    className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
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

            {/* Add Role to Company Card */}
            <div className="lg:col-span-6 rounded-3xl border border-zinc-800/90 bg-[#111317] p-6 sm:p-7 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Briefcase className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Add Role to Company</h3>
              </div>

              {roleMessage && (
                <p
                  className={`text-xs font-semibold ${
                    roleMessage.type === "success" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {roleMessage.text}
                </p>
              )}

              <form onSubmit={handleCreateRole} className="space-y-3.5">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Select Target Company *</label>
                  <select
                    value={targetCompanyId}
                    onChange={(e) => setTargetCompanyId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    {initialCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.roles.length} roles)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Role Title *</label>
                  <input
                    type="text"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    required
                    placeholder="e.g. Associate Software Engineer, Data Scientist"
                    className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 font-semibold text-white shadow-md shadow-purple-500/20 transition-all active:scale-95"
                >
                  Add Role to Company
                </button>
              </form>
            </div>
          </div>

          {/* Company & Role Directory */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Active Companies & Roles Directory ({initialCompanies.length})
                </h3>
                <p className="text-xs text-zinc-400">
                  Inspect all recruiting companies, add roles on the fly, or clean up empty records.
                </p>
              </div>

              {/* Company Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  placeholder="Filter companies..."
                  className="w-full rounded-xl border border-zinc-800 bg-[#111317] pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  className="rounded-2xl border border-zinc-800 bg-[#111317] p-5 space-y-3.5 shadow-sm hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/companies/${company.slug}`}
                          target="_blank"
                          className="font-bold text-white text-base hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>{company.name}</span>
                          <ExternalLink className="h-3 w-3 text-zinc-500" />
                        </Link>
                        {company.industry && (
                          <span className="rounded-full bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 text-[10px] text-zinc-300">
                            {company.industry}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {company._count?.experiences || 0} experiences · {company.roles.length} roles
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCompany(company.id, company.name)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Company"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Roles Pill List */}
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold block">
                      Associated Roles:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {company.roles.length > 0 ? (
                        company.roles.map((role: any) => (
                          <span
                            key={role.id}
                            className="group inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#0c0d10] px-2.5 py-1 text-xs text-zinc-300"
                          >
                            <span>{role.title}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(role.id, role.title)}
                              className="text-zinc-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity"
                              title="Delete Role"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500 italic">No roles added yet.</span>
                      )}
                    </div>
                  </div>

                  {/* Inline Add Role Form */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    {inlineRoleCompanyId === company.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={inlineRoleTitle}
                          onChange={(e) => setInlineRoleTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleInlineCreateRole(company.id)}
                          placeholder="New role title (e.g. SRE)..."
                          className="flex-1 rounded-lg border border-zinc-700 bg-[#0c0d10] px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleInlineCreateRole(company.id)}
                          disabled={isPending}
                          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInlineRoleCompanyId(null);
                            setInlineRoleTitle("");
                          }}
                          className="text-xs text-zinc-400 hover:text-white px-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setInlineRoleCompanyId(company.id);
                          setInlineRoleTitle("");
                        }}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Role to {company.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: QUESTIONS BANK MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === "questions" && (
        <div className="space-y-6">
          {/* Add Question Card */}
          <div className="rounded-3xl border border-zinc-800/90 bg-[#111317] p-6 sm:p-7 space-y-4 shadow-sm text-xs">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <HelpCircle className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Add Canonical Question to Bank</h3>
            </div>

            {questionMessage && (
              <p
                className={`text-xs font-semibold ${
                  questionMessage.type === "success" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {questionMessage.text}
              </p>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Question Text *</label>
                <textarea
                  rows={2}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  required
                  placeholder="e.g. Explain how indexing works in databases and when B-Trees vs Hash indexes are preferred."
                  className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Primary Topic</label>
                  <select
                    value={newQuestionTopicId}
                    onChange={(e) => setNewQuestionTopicId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Interview Round</label>
                  <select
                    value={newQuestionRound}
                    onChange={(e) => setNewQuestionRound(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="TECHNICAL">Technical Interview</option>
                    <option value="ONLINE_ASSESSMENT">Online Assessment (OA)</option>
                    <option value="HR">HR / Behavioral</option>
                    <option value="MANAGERIAL">Managerial</option>
                    <option value="APTITUDE">Aptitude</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Difficulty</label>
                  <select
                    value={newQuestionDifficulty}
                    onChange={(e) => setNewQuestionDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 font-semibold text-white shadow-md shadow-purple-500/20 transition-all active:scale-95"
              >
                Add Question
              </button>
            </form>
          </div>

          {/* Question List Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                Questions Bank Catalog ({initialQuestions.length})
              </h3>
              <p className="text-xs text-zinc-400">
                All platform questions aggregated across student experiences and placement drives.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full rounded-xl border border-zinc-800 bg-[#111317] pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Questions Grid/Table */}
          <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl bg-[#111317] overflow-hidden text-xs">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#16181e] transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {q.topic && (
                        <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                          {q.topic.name}
                        </span>
                      )}
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                        {q.round}
                      </span>
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-amber-400 capitalize">
                        {q.difficulty?.toLowerCase()}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Asked in {q._count?.experienceLinks || 0} experiences
                      </span>
                    </div>

                    <Link
                      href={`/questions/${q.slug}`}
                      target="_blank"
                      className="font-semibold text-sm text-zinc-100 hover:text-blue-400 transition-colors block line-clamp-2"
                    >
                      {q.text}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/questions/${q.slug}`}
                      target="_blank"
                      className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-blue-400 inline-flex items-center gap-1 font-semibold"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      disabled={isPending}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500">No questions found matching search.</div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: REGISTERED USERS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                Registered Students & Coordinators ({initialUsers.length})
              </h3>
              <p className="text-xs text-zinc-400">
                Oversee student accounts, assign coordinator admin privileges, and inspect contributor profiles.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email, branch..."
                className="w-full rounded-xl border border-zinc-800 bg-[#111317] pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl bg-[#111317] overflow-hidden text-xs">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const placementConfig =
                  PLACEMENT_STATUS_CONFIG[u.placementStatus || "PREPARING"] ||
                  PLACEMENT_STATUS_CONFIG.PREPARING;

                return (
                  <div
                    key={u.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#16181e] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <UserAvatar
                        name={u.name}
                        image={u.image}
                        size="md"
                        statusDotColor={placementConfig.dotColor}
                        showRing={true}
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/profile/${u.id}`}
                            target="_blank"
                            className="font-bold text-sm sm:text-base text-white hover:text-blue-400 transition-colors"
                          >
                            {u.name}
                          </Link>
                          {u.role === "ADMIN" ? (
                            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                              Admin Coordinator
                            </span>
                          ) : (
                            <span className="rounded-full bg-zinc-800 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                              Student
                            </span>
                          )}

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${placementConfig.badgeBg} ${placementConfig.badgeBorder} ${placementConfig.textColor}`}
                          >
                            {placementConfig.shortLabel}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-zinc-400 text-xs">
                          <span className="font-mono text-zinc-300">{u.email}</span>
                          {u.department && (
                            <>
                              <span>•</span>
                              <span>{u.department}</span>
                            </>
                          )}
                          {u.graduationYear && (
                            <>
                              <span>•</span>
                              <span>Class of {u.graduationYear}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{u._count?.experiences || 0} experiences posted</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/profile/${u.id}`}
                        target="_blank"
                        className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-zinc-300 hover:text-blue-400 inline-flex items-center gap-1 font-semibold"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleToggleUserRole(u.id, u.role, u.name)}
                        disabled={isPending}
                        className={`rounded-xl border px-3 py-1.5 font-semibold transition-all ${
                          u.role === "ADMIN"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            : "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        }`}
                        title={u.role === "ADMIN" ? "Revoke Admin Status" : "Promote to Admin"}
                      >
                        {u.role === "ADMIN" ? "Revoke Admin" : "Make Admin"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-zinc-500">No users found matching filter.</div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: PUBLISHED / VERIFIED EXPERIENCES */}
      {/* ========================================================= */}
      {activeTab === "all" && (
        <div className="space-y-3 text-xs">
          <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl bg-[#111317] overflow-hidden shadow-xs">
            {approvedExperiences.map((exp) => (
              <div
                key={exp.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#16181e] transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-base">
                      {exp.company.name} — {exp.role.title}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 text-[10px] font-semibold">
                      ● Verified
                    </span>
                    {exp.isFeatured && (
                      <span className="rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 text-[10px] font-bold">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 mt-1">
                    Year {exp.interviewYear} · {exp.viewsCount} views · Created {formatDate(exp.createdAt)}
                    {exp.user && ` · Posted by ${exp.user.name}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleModerate(exp.id, "FEATURE")}
                    disabled={isPending}
                    className="rounded-xl border border-zinc-700 bg-[#16181e] px-3 py-1.5 text-zinc-300 hover:border-amber-500 hover:text-amber-500 inline-flex items-center gap-1.5 transition-colors font-semibold"
                    title="Toggle featured status"
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${
                        exp.isFeatured ? "fill-amber-400 text-amber-500" : "text-zinc-500"
                      }`}
                    />
                    <span>{exp.isFeatured ? "Unfeature" : "Feature"}</span>
                  </button>

                  <Link
                    href={`/experiences/${exp.slug}`}
                    target="_blank"
                    className="rounded-xl border border-zinc-700 bg-[#16181e] px-3 py-1.5 text-zinc-300 hover:border-blue-500 hover:text-blue-500 inline-flex items-center gap-1.5 transition-colors font-semibold"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3 text-zinc-500" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleModerate(exp.id, "DELETE")}
                    disabled={isPending}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-400 hover:bg-rose-500/20 transition-colors"
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

      {/* ========================================================= */}
      {/* TAB 6: REPORTS TRIAGE */}
      {/* ========================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-3xl bg-[#111317] p-8 space-y-2">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
              <h4 className="text-base font-bold text-white">No Pending Reports</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No experiences or questions currently flagged by students.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="rounded-2xl border border-zinc-800 bg-[#111317] p-5 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold px-2.5 py-0.5 text-[10px]">
                          {rep.reason}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="font-semibold text-white">
                          Target:{" "}
                          {rep.experience
                            ? `Experience (${rep.experience.company.name} - ${rep.experience.role.title})`
                            : `Question: "${rep.question?.text}"`}
                        </span>
                      </div>
                      <p className="text-zinc-400 mt-1">
                        Reported on {formatDate(rep.createdAt)} by {rep.reporter?.name || "Anonymous Student"}
                      </p>
                      {rep.details && (
                        <p className="text-zinc-300 bg-[#16181e] p-3 rounded-xl mt-2 border border-zinc-800">
                          {rep.details}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReportAction(rep.id, "RESOLVED")}
                        disabled={isPending}
                        className="rounded-xl border border-zinc-700 bg-[#16181e] px-3 py-1.5 text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                      >
                        Mark Resolved
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReportAction(rep.id, "DISMISSED")}
                        disabled={isPending}
                        className="rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-800 px-3 py-1.5 transition-colors"
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
    </div>
  );
}
