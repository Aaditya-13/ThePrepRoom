"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck, UserCheck } from "lucide-react";
import { deleteUserExperienceAction } from "@/actions/experience";
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal";

interface AuthorExperienceActionsProps {
  experienceId: string;
  experienceTitle: string;
  isAuthor: boolean;
  isAdmin: boolean;
}

export function AuthorExperienceActions({
  experienceId,
  experienceTitle,
  isAuthor,
  isAdmin,
}: AuthorExperienceActionsProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthor && !isAdmin) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    const res = await deleteUserExperienceAction(experienceId);
    setIsDeleting(false);

    if (res?.error) {
      setErrorMessage(res.error);
      setShowModal(false);
    } else {
      router.push("/profile");
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-zinc-800 bg-[#14161d] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-300 font-medium">
          {isAdmin ? (
            <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
          ) : (
            <UserCheck className="h-4 w-4 text-blue-400 shrink-0" />
          )}
          <span>
            {isAdmin && !isAuthor
              ? "Administrator Management Controls"
              : "You authored this interview experience"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {errorMessage && (
            <span className="text-red-400 font-semibold">{errorMessage}</span>
          )}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={isDeleting}
            className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Experience</span>
          </button>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        itemType="experience"
        itemName={experienceTitle}
      />
    </>
  );
}
