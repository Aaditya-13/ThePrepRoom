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

  // Close on outside click
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

  // Keyboard navigation
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
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-colors text-left outline-none cursor-pointer ${
          disabled
            ? "border-zinc-800/80 bg-[#0d0e12] text-zinc-600 cursor-not-allowed opacity-60"
            : isOpen
            ? "border-zinc-600 bg-[#12141a] text-white shadow-md shadow-black/40"
            : "border-zinc-800 bg-[#0d0f14] text-zinc-200 hover:border-zinc-700 hover:bg-[#111319]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 truncate min-w-0">
          {selectedOption?.dotColor && (
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${selectedOption.dotColor}`}
            />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-zinc-300" : ""
          }`}
        />
      </button>

      {/* Floating Modern Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-zinc-800 bg-[#111317] p-1 shadow-2xl shadow-black/80 max-h-60 overflow-y-auto space-y-0.5"
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
                className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-zinc-800/90 text-white font-semibold"
                    : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
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
                    <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                      {opt.badge}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
