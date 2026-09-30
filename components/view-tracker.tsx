"use client";

import { useEffect, useRef } from "react";
import { recordUniqueViewAction, ViewTargetType } from "@/actions/views";

interface ViewTrackerProps {
  targetType: ViewTargetType;
  targetId: string;
  onViewsUpdated?: (newViews: number) => void;
}

export function ViewTracker({
  targetType,
  targetId,
  onViewsUpdated,
}: ViewTrackerProps) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!targetId || hasTriggered.current) return;
    hasTriggered.current = true;

    const storageKey = `tpr_view_${targetType.toLowerCase()}_${targetId}`;
    try {
      const lastViewed = localStorage.getItem(storageKey);
      const now = Date.now();
      const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

      // Skip if viewed within the last 24 hours
      if (lastViewed && now - Number(lastViewed) < TWENTY_FOUR_HOURS_MS) {
        return;
      }

      // Mark view in localStorage immediately to prevent duplicate runs
      localStorage.setItem(storageKey, String(now));

      // Record view in database
      recordUniqueViewAction(targetType, targetId)
        .then((res) => {
          if (res.success && typeof res.viewsCount === "number" && !res.alreadyViewed && onViewsUpdated) {
            onViewsUpdated(res.viewsCount);
          }
        })
        .catch(() => {});
    } catch {
      // In case localStorage is blocked by private mode
      recordUniqueViewAction(targetType, targetId)
        .then((res) => {
          if (res.success && typeof res.viewsCount === "number" && !res.alreadyViewed && onViewsUpdated) {
            onViewsUpdated(res.viewsCount);
          }
        })
        .catch(() => {});
    }
  }, [targetType, targetId, onViewsUpdated]);

  return null;
}
