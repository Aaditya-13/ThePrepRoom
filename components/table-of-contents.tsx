"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface TOCSection {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  sections: TOCSection[];
  company: {
    name: string;
    slug: string;
    description?: string | null;
  };
}

export function TableOfContents({ sections, company }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>(
    sections[0]?.id || ""
  );

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    setActiveSection(id);

    // Smooth scroll with proper offset
    element.scrollIntoView({ behavior: "smooth", block: "start" });

    // Briefly apply ambient highlight pulse without any browser focus bounding box
    element.classList.remove("section-highlight");
    // Trigger reflow to restart animation if clicked repeatedly
    void element.offsetWidth;
    element.classList.add("section-highlight");
    setTimeout(() => {
      element.classList.remove("section-highlight");
    }, 1300);

    // Update URL hash smoothly without jump
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="sticky top-24 rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-6 space-y-5 shadow-xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100 border-b border-stone-100 dark:border-zinc-800 pb-2">
        On This Page
      </h3>

      <nav className="space-y-1 text-xs font-medium" aria-label="Table of Contents">
        {sections.map((section, idx) => {
          const isActive = activeSection === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleSectionClick(e, section.id)}
              className={`block px-3 py-1.5 rounded-lg transition-all duration-200 select-none ${
                isActive
                  ? "bg-blue-500/10 text-blue-500 dark:text-blue-400 font-semibold border-l-2 border-blue-500 shadow-2xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800/50"
              }`}
            >
              <span>{idx + 1}. </span>
              <span>{section.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Company snapshot */}
      <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 space-y-2.5">
        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
          About {company.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
          {company.description || "Leading global technology enterprise."}
        </p>
        <Link
          href={`/companies/${company.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 pt-1 transition-colors"
        >
          <span>View all company experiences</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
