"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface StickySidebarProps {
  children: ReactNode;
  className?: string;
  topOffset?: number; // Sticky top in px (default 80px = top-20 = 5rem)
  bottomGap?: number; // Clearance from viewport bottom in px (default 24px)
}

export function StickySidebar({
  children,
  className = "",
  topOffset = 80,
  bottomGap = 24,
}: StickySidebarProps) {
  const asideRef = useRef<HTMLElement>(null);
  const [maxHeightStyle, setMaxHeightStyle] = useState<string | undefined>(undefined);

  useEffect(() => {
    let rafId: number | null = null;

    const calculateMaxHeight = () => {
      if (!asideRef.current) return;

      // On mobile/tablet (< 1024px), sidebar flows normally in document flow
      if (window.innerWidth < 1024) {
        setMaxHeightStyle(undefined);
        return;
      }

      const rect = asideRef.current.getBoundingClientRect();

      // rect.top is the live distance between the top of the element and the top of the viewport.
      // When the page is at the top, rect.top is ~150-170px (below header & title).
      // As the user scrolls the page down, rect.top decreases until it reaches topOffset (80px),
      // where CSS sticky anchors it.
      const currentTop = Math.max(rect.top, topOffset);
      const availableHeight = window.innerHeight - currentTop - bottomGap;
      const safeHeight = Math.max(300, Math.floor(availableHeight));

      setMaxHeightStyle(`${safeHeight}px`);
    };

    calculateMaxHeight();

    const onScrollOrResize = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        calculateMaxHeight();
        rafId = null;
      });
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [topOffset, bottomGap]);

  return (
    <aside
      ref={asideRef}
      style={maxHeightStyle ? { maxHeight: maxHeightStyle } : undefined}
      className={`lg:sticky lg:top-20 lg:overflow-y-auto overscroll-contain pr-1 z-20 scrollbar-thin ${className}`}
    >
      {children}
    </aside>
  );
}
