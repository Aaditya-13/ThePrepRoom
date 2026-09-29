"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SearchShortcut() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't hijack if user is currently typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "/") {
        // Look for any existing search input on the current page
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search" i], input[name="q"], input[type="search"]'
        );

        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        } else {
          // If no search input exists on current page (e.g. landing page), navigate to search
          e.preventDefault();
          router.push("/search");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
