"use client";

import { useState, useTransition } from "react";
import { Flag, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { submitReportAction } from "@/actions/report";

interface ReportModalProps {
  experienceId?: string;
  questionId?: string;
  targetTitle?: string;
  triggerLabel?: string;
  className?: string;
}

const REPORT_REASONS = [
  "Incorrect information",
  "Spam or fake submission",
  "Personal / confidential data",
  "Offensive language",
  "Duplicate entry",
  "Other issue",
];

export function ReportModal({
  experienceId,
  questionId,
  targetTitle,
  triggerLabel = "Report",
  className = "",
}: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await submitReportAction({
        experienceId,
        questionId,
        reason,
        details,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setIsOpen(false);
          setDetails("");
        }, 1800);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors ${className}`}
        title="Report this content"
      >
        <Flag className="h-3 w-3" />
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-50">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Report {experienceId ? "Experience" : "Question"}
                </h3>
                {targetTitle && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                    {targetTitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-1" />
                <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">Report Submitted</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Thank you. Our placement coordinators will review this entry promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-600 dark:text-rose-400 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Reason for report
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Additional Context (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide details to assist moderation..."
                    className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] p-3 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-4 py-2 font-semibold text-slate-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    {isPending ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
