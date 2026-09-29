"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  PlusCircle,
  Edit3,
  Building2,
  Calendar,
  Camera,
  ExternalLink,
} from "lucide-react";
import { ProfileEditModal } from "@/components/profile-edit-form";
import { PLACEMENT_STATUS_CONFIG } from "@/lib/profile-constants";
import { UserAvatar } from "@/components/user-avatar";

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

interface ProfileHeaderClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string | null;
    graduationYear?: number | null;
    bio?: string | null;
    image?: string | null;
    linkedinUrl?: string | null;
    placementStatus?: string | null;
    placedCompany?: string | null;
  };
  bookmarksCount: number;
}

export function ProfileHeaderClient({ user: initialUser, bookmarksCount }: ProfileHeaderClientProps) {
  const [user, setUser] = useState(initialUser);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const statusKey = user.placementStatus || "PREPARING";
  const statusConfig = PLACEMENT_STATUS_CONFIG[statusKey] || PLACEMENT_STATUS_CONFIG.PREPARING;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-[#111317] p-6 sm:p-8 shadow-xl shadow-black/40 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* User Identity Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with Camera Overlay & Status Dot */}
            <div className="relative group">
              <UserAvatar
                name={user.name}
                image={user.image}
                size="2xl"
                statusDotColor={statusConfig.dotColor}
                showRing={true}
              />
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                title="Change Profile Photo"
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer text-white"
              >
                <Camera className="h-6 w-6 text-white drop-shadow-md" />
              </button>
            </div>

            {/* Name, Badges & Metadata */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
                  {user.name}
                </h1>
                {user.role === "ADMIN" && (
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Admin
                  </span>
                )}

                {/* Placement Journey Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.badgeBg} ${statusConfig.badgeBorder} ${statusConfig.textColor}`}
                >
                  <span className={`h-2 w-2 rounded-full ${statusConfig.dotColor} animate-pulse`} />
                  <span>
                    {statusKey === "OFFER_ACCEPTED" && user.placedCompany
                      ? `Offer Secured • ${user.placedCompany}`
                      : statusConfig.label}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                {user.email}
              </p>

              {/* Department, Year & LinkedIn Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {user.department && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#0c0d10] px-3 py-1 text-xs font-medium text-zinc-300">
                    <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{user.department}</span>
                  </span>
                )}

                {user.graduationYear && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#0c0d10] px-3 py-1 text-xs font-medium text-zinc-300">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Class of {user.graduationYear}</span>
                  </span>
                )}

                {user.linkedinUrl ? (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 px-3 py-1 text-xs font-semibold text-[#0A66C2] transition-colors"
                  >
                    <LinkedInIcon className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <LinkedInIcon className="h-3.5 w-3.5" />
                    <span>+ Add LinkedIn</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 hover:border-zinc-600 px-4 py-2 text-xs font-semibold text-white inline-flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-400" />
              <span>Edit Profile</span>
            </button>

            <Link
              href="/bookmarks"
              className="rounded-xl border border-zinc-800 bg-[#16181e] hover:border-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white inline-flex items-center gap-2 transition-all shadow-xs"
            >
              <Bookmark className="h-3.5 w-3.5 text-blue-400" />
              <span>Saved ({bookmarksCount})</span>
            </Link>

            <Link
              href="/share"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 inline-flex items-center gap-1.5 transition-all active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Share Experience</span>
            </Link>
          </div>
        </div>

        {/* Bio / Advice */}
        {user.bio && (
          <div className="pt-4 border-t border-zinc-800/80 text-xs text-zinc-300 leading-relaxed bg-[#0c0d10]/60 p-4 rounded-xl border border-zinc-800/50">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              About & Placement Advice:
            </p>
            <p className="italic text-zinc-200">{user.bio}</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        user={user}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onProfileUpdated={(updated) => {
          setUser((prev) => ({ ...prev, ...updated }));
        }}
      />
    </>
  );
}
