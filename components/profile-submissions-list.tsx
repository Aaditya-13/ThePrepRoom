"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  ArrowRight,
  Building2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { deleteUserExperienceAction } from "@/actions/experience";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";

interface SubmissionItem {
  id: string;
  slug: string;
  interviewYear: number;
  status: string;
  updatedAt: Date | string;
  isAnonymous: boolean;
  company: {
    name: string;
    slug?: string;
  };
  role: {
    title: string;
  };
}

interface ProfileSubmissionsListProps {
  experiences: SubmissionItem[];
}

export function ProfileSubmissionsList({ experiences: initialExperiences }: ProfileSubmissionsListProps) {
  const router = useRouter();
  const [experiences, setExperiences] = useState<SubmissionItem[]>(initialExperiences);
  const [activeTab, setActiveTab] = useState<"ALL" | "APPROVED" | "PENDING" | "DRAFT">("ALL");
  const [itemToDelete, setItemToDelete] = useState<SubmissionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setStatusNotice(null);

    const res = await deleteUserExperienceAction(itemToDelete.id);
    setIsDeleting(false);

    if (res?.error) {
      setStatusNotice({ type: "error", text: res.error });
    } else {
      const deletedType = itemToDelete.status === "DRAFT" ? "Draft" : "Experience";
      setExperiences((prev) => prev.filter((e) => e.id !== itemToDelete.id));
      setStatusNotice({
        type: "success",
        text: `${deletedType} deleted successfully.`,
      });
      setItemToDelete(null);
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const approved = experiences.filter((e) => e.status === "APPROVED");
  const pending = experiences.filter((e) => e.status === "PENDING");
  const drafts = experiences.filter((e) => e.status === "DRAFT");

  const filtered =
    activeTab === "ALL"
      ? experiences
      : activeTab === "APPROVED"
      ? approved
      : activeTab === "PENDING"
      ? pending
      : drafts;

  return (
    <div className="space-y-4">
      {/* Tab Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <h2 className="text-lg font-bold text-white font-heading">
          Your Placement Contributions ({experiences.length})
        </h2>

        {experiences.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-zinc-800 text-white shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              All ({experiences.length})
            </button>

            {approved.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("APPROVED")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "APPROVED"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/50"
                }`}
              >
                Verified ({approved.length})
              </button>
            )}

            {pending.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("PENDING")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "PENDING"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/50"
                }`}
              >
                Unverified ({pending.length})
              </button>
            )}

            {drafts.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("DRAFT")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "DRAFT"
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    : "text-zinc-400 hover:text-blue-400 hover:bg-zinc-800/50"
                }`}
              >
                Drafts ({drafts.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notification Banner */}
      {statusNotice && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold flex items-center justify-between gap-3 border ${
            statusNotice.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
              : "bg-red-500/10 text-red-400 border-red-500/25"
          }`}
        >
          <span>{statusNotice.text}</span>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Submissions List */}
      {experiences.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-3xl bg-[#111317] p-8 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400">
            <FileText className="h-6 w-6" />
          </div>
          <p className="text-base font-bold text-zinc-200">No interview submissions yet.</p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Share your campus or off-campus interview experience to help juniors crack their dream roles.
          </p>
          <div className="pt-2">
            <Link
              href="/share"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <span>Share Experience</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-zinc-800 rounded-2xl bg-[#111317] p-6 text-zinc-400 text-xs">
          No submissions found for the selected category.
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-2xl bg-[#111317] overflow-hidden shadow-xs">
          {filtered.map((exp) => {
            let badgeBg = "bg-zinc-800 text-zinc-300 border-zinc-700";
            let statusLabel = exp.status;

            if (exp.status === "APPROVED") {
              badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              statusLabel = "Verified";
            } else if (exp.status === "PENDING") {
              badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
              statusLabel = "Unverified (Public)";
            } else if (exp.status === "DRAFT") {
              badgeBg = "bg-blue-500/10 text-blue-400 border-blue-500/20";
              statusLabel = "Draft";
            } else if (exp.status === "REJECTED") {
              badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/20";
              statusLabel = "Revision Requested";
            }

            return (
              <div
                key={exp.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#15171d] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-base">
                      {exp.company.name} — {exp.role.title}
                    </h3>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeBg}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Placement Year {exp.interviewYear} · {exp.isAnonymous ? "Anonymous Submission" : "Public Author"} · Updated {formatDate(exp.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {exp.status === "APPROVED" && (
                    <Link
                      href={`/experiences/${exp.slug}`}
                      className="rounded-xl border border-zinc-700 bg-[#16181e] hover:border-blue-500 hover:text-blue-400 px-3.5 py-1.5 text-xs text-zinc-200 inline-flex items-center gap-1.5 font-semibold transition-colors shadow-xs"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  {exp.status === "PENDING" && (
                    <Link
                      href={`/experiences/${exp.slug}`}
                      className="rounded-xl border border-zinc-700 bg-[#16181e] hover:border-amber-500 hover:text-amber-400 px-3.5 py-1.5 text-xs text-zinc-200 inline-flex items-center gap-1.5 font-semibold transition-colors shadow-xs"
                    >
                      <span>View Live</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  {exp.status === "DRAFT" && (
                    <Link
                      href={`/share?draftId=${exp.id}`}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-1.5 text-xs text-white inline-flex items-center gap-1.5 font-semibold transition-colors shadow-xs active:scale-95"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Resume Draft</span>
                    </Link>
                  )}

                  {/* Delete Button with Warning Confirmation */}
                  <button
                    type="button"
                    onClick={() => setItemToDelete(exp)}
                    className="rounded-xl border border-zinc-700/60 hover:border-red-500/50 bg-[#16181e] hover:bg-red-500/10 text-zinc-400 hover:text-red-400 px-2.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    title={exp.status === "DRAFT" ? "Delete Draft" : "Delete Experience"}
                    aria-label={exp.status === "DRAFT" ? "Delete Draft" : "Delete Experience"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-[11px]">Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal with Warning */}
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        itemType={itemToDelete?.status === "DRAFT" ? "draft" : "experience"}
        itemName={
          itemToDelete
            ? `${itemToDelete.company.name} — ${itemToDelete.role.title} (${itemToDelete.interviewYear})`
            : undefined
        }
      />
    </div>
  );
}
