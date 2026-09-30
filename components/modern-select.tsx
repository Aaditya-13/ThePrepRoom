"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface ModernSelectOption {
  value: string;
  label: string;
  dotColor?: string;
  badge?: string;
  description?: string;
}

interface ModernSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: ModernSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ModernSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicked outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard navigation (Escape to close)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "Enter" || e.key === " ") {
        if (!isOpen) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
    },
    [disabled, isOpen]
  );

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-medium transition-all text-left outline-none cursor-pointer ${
          disabled
            ? "border-zinc-800 bg-[#0d0e12] text-zinc-600 cursor-not-allowed opacity-60"
            : isOpen
            ? "border-blue-500/80 bg-[#0d0e13] ring-1 ring-blue-500/40 shadow-lg shadow-blue-500/10 text-white"
            : "border-zinc-700/80 bg-[#0c0d10] text-zinc-100 hover:border-zinc-600 hover:bg-[#101217]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {selectedOption?.dotColor && (
            <span
              className={`h-2.5 w-2.5 rounded-full shrink-0 shadow-xs ${selectedOption.dotColor}`}
            />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-400" : ""
          }`}
        />
      </button>

      {/* Floating Modern Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border border-zinc-700/90 bg-[#12141a]/95 backdrop-blur-xl p-1.5 shadow-2xl shadow-black/90 max-h-60 overflow-y-auto space-y-1 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800/80 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  {opt.dotColor && (
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${opt.dotColor}`}
                    />
                  )}
                  <div className="flex flex-col truncate">
                    <span className="truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="text-[10px] text-zinc-500 font-normal truncate">
                        {opt.description}
                      </span>
                    )}
                  </div>
                  {opt.badge && (
                    <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 text-[10px] text-blue-400">
                      {opt.badge}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
