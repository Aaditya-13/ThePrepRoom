"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress on route change
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept link clicks to give 0ms instant feedback
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");

      // Only handle internal navigation
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !href.startsWith("/#") &&
        targetAttr !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // If clicking on current path with same params, do not show
        const currentUrl = window.location.pathname + window.location.search;
        if (href === currentUrl) return;

        setIsNavigating(true);
        setProgress(25);

        // Gradually advance progress while waiting
        setTimeout(() => setProgress((p) => (p === 25 ? 65 : p)), 100);
        setTimeout(() => setProgress((p) => (p === 65 ? 85 : p)), 300);
      }
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleLinkClick, { capture: true });
    };
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none overflow-hidden"
    >
      <div
        className="h-full bg-linear-to-r from-blue-500 via-indigo-400 to-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: "width, opacity",
          transitionDuration: progress === 100 ? "180ms" : "250ms",
        }}
      />
    </div>
  );
}
