"use client";

import { useState } from "react";
import { ViewTracker } from "./view-tracker";
import { ViewTargetType } from "@/actions/views";
import { Eye } from "lucide-react";

interface ViewCounterProps {
  targetType: ViewTargetType;
  targetId: string;
  initialViews: number;
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
}

export function ViewCounter({
  targetType,
  targetId,
  initialViews,
  className = "inline-flex items-center gap-1 font-mono text-zinc-400",
  iconClassName = "h-3.5 w-3.5 text-blue-400",
  showIcon = true,
}: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);

  return (
    <>
      <span className={className}>
        {showIcon && <Eye className={iconClassName} />}
        <span>
          {views} {views === 1 ? "view" : "views"}
        </span>
      </span>
      <ViewTracker
        targetType={targetType}
        targetId={targetId}
        onViewsUpdated={setViews}
      />
    </>
  );
}
