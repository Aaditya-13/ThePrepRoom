"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmarkAction, BookmarkTargetType } from "@/actions/bookmark";

interface BookmarkButtonProps {
  targetType: BookmarkTargetType;
  targetId: string;
  initialBookmarked?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function BookmarkButton({
  targetType,
  targetId,
  initialBookmarked = false,
  showLabel = false,
  className = "",
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic toggle
    const nextState = !bookmarked;
    setBookmarked(nextState);

    startTransition(async () => {
      const res = await toggleBookmarkAction(targetType, targetId);
      if (res.error) {
        setBookmarked(!nextState);
        alert(res.error);
      } else if (typeof res.isBookmarked === "boolean") {
        setBookmarked(res.isBookmarked);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={bookmarked ? "Remove bookmark" : "Save bookmark"}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 border ${
        bookmarked
          ? "border-blue-500 bg-blue-600 text-white shadow-xs"
          : "border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] text-slate-700 dark:text-zinc-300 hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400"
      } ${className}`}
    >
      <Bookmark
        className={`h-3.5 w-3.5 ${
          bookmarked
            ? "fill-current"
            : "text-slate-400 dark:text-zinc-500"
        }`}
      />
      {showLabel && (
        <span>{bookmarked ? "Saved" : "Save"}</span>
      )}
    </button>
  );
}
