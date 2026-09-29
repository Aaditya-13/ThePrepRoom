"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  X,
  Upload,
  Trash2,
  Link as LinkIcon,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";
import { updateUserProfileAction } from "@/actions/user";
import { PLACEMENT_STATUS_CONFIG, COMMON_DEPARTMENTS } from "@/lib/profile-constants";
import { UserAvatar } from "@/components/user-avatar";

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

/**
 * Resizes an image file client-side to maximum 400x400 pixels
 * to ensure instant rendering, zero lag, and minimal SQLite storage payload.
 */
function compressImageClient(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = reject;
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Modern Custom Department / Branch Dropdown Menu
 */
function DepartmentDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const filtered = COMMON_DEPARTMENTS.filter((dept) =>
    dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border bg-[#0c0d10] py-2 px-3 text-xs sm:text-sm text-left transition-all cursor-pointer ${
          isOpen
            ? "border-blue-500 ring-1 ring-blue-500/40"
            : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="h-4 w-4 text-zinc-500 shrink-0" />
          <span className={value ? "text-zinc-100 font-medium truncate" : "text-zinc-500"}>
            {value || "Select Department / Branch"}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-400" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 z-50 rounded-xl border border-zinc-700 bg-[#161820] p-1.5 shadow-2xl shadow-black animate-popover">
          {/* Search box inside dropdown */}
          <div className="relative mb-1.5">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or enter branch..."
              className="w-full rounded-lg border border-zinc-700/80 bg-[#0c0d10] py-1.5 pl-8 pr-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-hidden"
              autoFocus
            />
          </div>

          {/* Department List */}
          <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1">
            {filtered.map((dept) => {
              const isSelected = value.toLowerCase() === dept.toLowerCase();
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => {
                    onChange(dept);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-blue-600/15 text-blue-400 font-semibold"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span className="truncate">{dept}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0 ml-1.5" />}
                </button>
              );
            })}

            {/* Custom search item if not in predefined list */}
            {search.trim() &&
              !COMMON_DEPARTMENTS.some(
                (d) => d.toLowerCase() === search.trim().toLowerCase()
              ) && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(search.trim());
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-colors cursor-pointer text-left border border-blue-500/30 mt-1"
                >
                  <span className="truncate font-semibold">Use "{search.trim()}"</span>
                  <Check className="h-3.5 w-3.5 text-blue-400 shrink-0 ml-1.5" />
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Modern Custom Graduation Year Dropdown Menu
 */
function GraduationYearDropdown({
  value,
  onChange,
  yearOptions,
}: {
  value: string;
  onChange: (val: string) => void;
  yearOptions: number[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border bg-[#0c0d10] py-2 px-3 text-xs sm:text-sm text-left transition-all cursor-pointer ${
          isOpen
            ? "border-blue-500 ring-1 ring-blue-500/40"
            : "border-zinc-800 hover:border-zinc-700"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
          <span className={value ? "text-zinc-100 font-medium truncate" : "text-zinc-500"}>
            {value ? `Class of ${value}` : "Select Batch Year"}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-400" : ""
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 z-50 rounded-xl border border-zinc-700 bg-[#161820] p-1.5 shadow-2xl shadow-black animate-popover">
          <div className="max-h-40 overflow-y-auto space-y-0.5 pr-1">
            {yearOptions.map((year) => {
              const yearStr = year.toString();
              const isSelected = value === yearStr;
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    onChange(yearStr);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-blue-600/15 text-blue-400 font-semibold"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span>Class of {year}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ProfileEditFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    graduationYear?: number | null;
    linkedinUrl?: string | null;
    placementStatus?: string | null;
    placedCompany?: string | null;
    bio?: string | null;
    image?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: any) => void;
}

export function ProfileEditModal({ user, isOpen, onClose, onProfileUpdated }: ProfileEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(user.name || "");
  const [department, setDepartment] = useState(user.department || "");
  const [graduationYear, setGraduationYear] = useState(
    user.graduationYear ? user.graduationYear.toString() : ""
  );
  const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "");
  const [placementStatus, setPlacementStatus] = useState(
    user.placementStatus || "PREPARING"
  );
  const [placedCompany, setPlacedCompany] = useState(user.placedCompany || "");
  const [bio, setBio] = useState(user.bio || "");

  // Photo state
  const [previewImage, setPreviewImage] = useState<string | null>(user.image || null);
  const [imageAction, setImageAction] = useState<"KEEP" | "UPDATE" | "REMOVE">("KEEP");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image file is too large. Please select an image under 5MB.");
      return;
    }

    try {
      setError(null);
      const compressedDataUrl = await compressImageClient(file);
      setPreviewImage(compressedDataUrl);
      setImageAction("UPDATE");
    } catch {
      setError("Failed to process image. Please try another image.");
    }
  };

  const handleApplyUrl = () => {
    if (!customImageUrl.trim()) return;
    try {
      new URL(customImageUrl.trim());
      setPreviewImage(customImageUrl.trim());
      setImageAction("UPDATE");
      setShowUrlInput(false);
    } catch {
      setError("Please enter a valid image URL (e.g. https://example.com/avatar.jpg)");
    }
  };

  const handleRemovePhoto = () => {
    setPreviewImage(null);
    setImageAction("REMOVE");
    setCustomImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("department", department);
    formData.append("graduationYear", graduationYear);
    formData.append("linkedinUrl", linkedinUrl);
    formData.append("placementStatus", placementStatus);
    formData.append("placedCompany", placedCompany);
    formData.append("bio", bio);
    formData.append("imageAction", imageAction);
    if (imageAction === "UPDATE" && previewImage) {
      formData.append("image", previewImage);
    }

    startTransition(async () => {
      const res = await updateUserProfileAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Profile saved!");
        if (onProfileUpdated && res?.user) {
          onProfileUpdated(res.user);
        }
        router.refresh();
        setTimeout(() => {
          onClose();
        }, 300);
      }
    });
  };

  const currentGradYear = new Date().getFullYear();
  // 9 years: from currentYear-2 up to currentYear+6
  const yearOptions = Array.from({ length: 9 }, (_, i) => currentGradYear - 2 + i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 overflow-y-auto"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg my-auto rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#111317] shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[min(540px,calc(100vh-2.5rem))] max-h-[min(540px,calc(100dvh-2.5rem))]"
      >
        {/* 1. FIXED TOP HEADER */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#111317]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-heading">
              Edit Your Information
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Customize your profile photo, academic credentials, and career status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. SCROLLABLE FORM BODY (Clean & Smooth) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3.5 space-y-3.5 text-xs overscroll-contain">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Profile Photo Section */}
          <div className="rounded-xl border border-zinc-800/90 bg-[#0e1014] p-3 space-y-2">
            <label className="block font-semibold text-zinc-200 text-xs">
              Profile Photo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={name}
                  image={previewImage}
                  size="md"
                  showRing={true}
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-200">
                    {previewImage ? "Custom Photo Active" : "Default 2-Letter Initials"}
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    {previewImage
                      ? "Photo displayed across your profile & experiences."
                      : "Without a photo, your 2-letter initials represent you."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Photo</span>
                </button>

                {previewImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 text-zinc-300 px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Remove</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-[#14161c] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-2 py-1.5 text-[11px] transition-colors cursor-pointer"
                >
                  <LinkIcon className="h-3 w-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {showUrlInput && (
              <div className="pt-1.5 flex items-center gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 rounded-lg border border-zinc-700 bg-[#0c0d10] px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ved Kalantri"
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2 pl-9 pr-3 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Department & Graduation Year Dropdowns (Real Aesthetic Dropdown Menus) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Department / Branch
              </label>
              <DepartmentDropdown
                value={department}
                onChange={(val) => setDepartment(val)}
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Graduation Year (Batch)
              </label>
              <GraduationYearDropdown
                value={graduationYear}
                onChange={(val) => setGraduationYear(val)}
                yearOptions={yearOptions}
              />
            </div>
          </div>

          {/* LinkedIn Profile URL */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              LinkedIn Profile URL
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5">
                <LinkedInIcon className="h-4 w-4" />
              </div>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2 pl-9 pr-3 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Placement / Career Status */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-zinc-300">
              Placement / Career Status *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(PLACEMENT_STATUS_CONFIG).map((option) => {
                const isSelected = placementStatus === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPlacementStatus(option.value)}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? `${option.badgeBorder} ${option.badgeBg} ring-1 ring-blue-500/40`
                        : "border-zinc-800/80 bg-[#0c0d10] hover:border-zinc-700 hover:bg-[#14161c]"
                    }`}
                  >
                    <div className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${option.dotColor}`} />
                    <div className="space-y-0.5 min-w-0">
                      <p className={`font-semibold text-xs truncate ${isSelected ? option.textColor : "text-zinc-200"}`}>
                        {option.label}
                      </p>
                      <p className="text-[10px] text-zinc-500 line-clamp-1 leading-tight">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Placed Company & Role (Conditional) */}
          {placementStatus === "OFFER_ACCEPTED" && (
            <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
              <label className="block font-semibold text-emerald-300 text-xs">
                Company & Role Secured
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={placedCompany}
                  onChange={(e) => setPlacedCompany(e.target.value)}
                  placeholder="e.g. Microsoft - Software Engineer, TCS - Digital"
                  className="w-full rounded-xl border border-emerald-500/30 bg-[#0c0d10] py-1.5 pl-9 pr-3 text-emerald-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden transition-all text-xs"
                />
              </div>
            </div>
          )}

          {/* Bio */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Bio / Placement Advice
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short intro, your tech focus, or advice for juniors..."
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2 pl-9 pr-3 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. DOCKED BOTTOM ACTION BAR (ALWAYS 100% VISIBLE ON SCREEN) */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 px-5 py-3 border-t border-zinc-800 bg-[#111317]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 hover:text-white text-zinc-200 px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isPending ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
