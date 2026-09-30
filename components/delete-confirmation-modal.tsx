"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  itemType?: "draft" | "experience";
  itemName?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title,
  itemType = "experience",
  itemName,
}: DeleteConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#12141a] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
      >
        {/* Header Icon + Close */}
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">
            {title || `Delete this ${itemType === "draft" ? "Draft" : "Experience"}?`}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {itemType === "draft"
              ? "Are you sure you want to delete this saved draft? Any unsubmitted interview questions and details will be permanently removed."
              : "Are you sure you want to delete this interview experience? It will be permanently removed from public view and cannot be restored."}
          </p>

          {itemName && (
            <div className="rounded-xl border border-zinc-800 bg-[#161820] p-3 text-xs font-semibold text-zinc-200 truncate">
              {itemName}
            </div>
          )}
        </div>

        {/* Warning callout */}
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
          <span>This action is permanent and cannot be undone.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 hover:text-white px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md shadow-red-600/25 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete {itemType === "draft" ? "Draft" : "Experience"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
