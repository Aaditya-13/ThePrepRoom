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
} from "lucide-react";
import { updateUserProfileAction } from "@/actions/user";
import { PLACEMENT_STATUS_CONFIG } from "@/lib/profile-constants";
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

const COMMON_BRANCHES = [
  "Information Technology",
  "Computer Science & Engineering",
  "Artificial Intelligence & Data Science",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
];

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
  // 8 years: from currentYear-2 up to currentYear+5
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentGradYear - 2 + i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 transition-opacity duration-150"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl h-[85vh] max-h-[640px] rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#111317] shadow-2xl shadow-black overflow-hidden flex flex-col animate-popover"
      >
        {/* 1. FIXED TOP HEADER (NO Student Profile Settings badge) */}
        <div className="shrink-0 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-800 bg-[#111317]">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading">
              Edit Your Information
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Customize your profile photo, academic credentials, and career status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. SCROLLABLE FORM BODY (Completely Independent & Smooth) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 text-xs overscroll-contain">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Profile Photo Section */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0e1014] p-3.5 space-y-2.5">
            <label className="block font-semibold text-zinc-200">
              Profile Photo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  name={name}
                  image={previewImage}
                  size="lg"
                  showRing={true}
                />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-200">
                    {previewImage ? "Custom Photo Active" : "Default 2-Letter Initials"}
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    {previewImage
                      ? "Photo displayed across your profile and experiences."
                      : "Without a photo, your first & last initials represent you."}
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Photo</span>
                </button>

                {previewImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 text-zinc-300 px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Remove</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#14161c] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-2 py-1.5 text-[11px] transition-colors cursor-pointer"
                >
                  <LinkIcon className="h-3 w-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {showUrlInput && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 rounded-xl border border-zinc-700 bg-[#0c0d10] px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
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
              <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ved Kalantri"
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Modern Department / Branch Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-300">
                Department / Branch
              </label>
              {department && (
                <button
                  type="button"
                  onClick={() => setDepartment("")}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Type or select a branch below..."
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm"
              />
            </div>

            {/* Quick-Pick Branch Chips */}
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {COMMON_BRANCHES.map((dept) => {
                const isSelected = department.toLowerCase() === dept.toLowerCase();
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setDepartment(dept)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold"
                        : "bg-[#0c0d10] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modern Graduation Year Selector (Aesthetic 1-Tap Pills) */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Graduation Year (Batch)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {yearOptions.map((year) => {
                const isSelected = graduationYear === year.toString();
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setGraduationYear(year.toString())}
                    className={`py-1.5 px-1 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                        : "bg-[#0c0d10] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-[#14161c]"
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>

          {/* LinkedIn Profile URL */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              LinkedIn Profile URL
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-2.5">
                <LinkedInIcon className="h-4 w-4" />
              </div>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm"
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
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
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
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
              <label className="block font-semibold text-emerald-300">
                Company & Role Secured
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-2.5 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={placedCompany}
                  onChange={(e) => setPlacedCompany(e.target.value)}
                  placeholder="e.g. Microsoft - Software Engineer, TCS - Digital"
                  className="w-full rounded-xl border border-emerald-500/30 bg-[#0c0d10] py-2 pl-10 pr-4 text-emerald-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden transition-all text-xs sm:text-sm"
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
              <FileText className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
              <textarea
                rows={2.5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short intro, your tech focus, or advice for juniors..."
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. DOCKED BOTTOM ACTION BAR (PERMANENTLY VISIBLE & ACCESSIBLE) */}
        <div className="shrink-0 flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-zinc-800 bg-[#111317]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 hover:text-white text-zinc-200 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isPending ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
