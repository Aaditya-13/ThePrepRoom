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
      }, 260);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept internal link clicks for immediate tactile feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        target.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        const currentPath = window.location.pathname + window.location.search;
        if (href !== currentPath) {
          setIsNavigating(true);
          setProgress(25);
          setTimeout(() => {
            setProgress((prev) => (prev >= 25 && prev < 85 ? 75 : prev));
          }, 100);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition:
            progress === 100
              ? "width 180ms ease-out, opacity 250ms ease 120ms"
              : "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}
