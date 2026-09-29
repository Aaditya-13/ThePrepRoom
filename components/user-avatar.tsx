"use client";

import { useState } from "react";
import { getUserInitials } from "@/lib/user-utils";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  statusDotColor?: string;
  showRing?: boolean;
}

const SIZE_MAP = {
  xs: "h-6 w-6 text-[10px] rounded-lg",
  sm: "h-7 w-7 text-[11px] rounded-full",
  md: "h-9 w-9 text-xs rounded-xl",
  lg: "h-11 w-11 text-sm rounded-xl",
  xl: "h-16 w-16 text-lg rounded-2xl",
  "2xl": "h-20 w-20 text-2xl sm:text-3xl rounded-2xl",
};

export function UserAvatar({
  name,
  image,
  size = "md",
  className = "",
  statusDotColor,
  showRing = false,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getUserInitials(name);
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  const hasValidImage = Boolean(image && !imageError);

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`${sizeClass} flex items-center justify-center overflow-hidden transition-all duration-150 select-none ${
          showRing
            ? "ring-2 ring-blue-500/40 shadow-sm"
            : ""
        }`}
      >
        {hasValidImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image!}
            alt={name || "User Avatar"}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 font-heading font-black tracking-tight text-white shadow-inner">
            <span>{initials}</span>
          </div>
        )}
      </div>

      {statusDotColor && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[#111317] ${statusDotColor} ${
            size === "xs" || size === "sm"
              ? "h-2.5 w-2.5"
              : size === "md" || size === "lg"
              ? "h-3 w-3"
              : "h-4 w-4"
          }`}
        />
      )}
    </div>
  );
}
