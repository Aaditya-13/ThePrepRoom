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
  Sparkles,
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

    // Limit raw upload to 5MB before compression
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
        }, 400);
      }
    });
  };

  const currentGradYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentGradYear - 2 + i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs transition-opacity duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-zinc-800 bg-[#111317] p-5 sm:p-7 shadow-2xl shadow-black/90 overflow-hidden max-h-[92vh] flex flex-col transform-gpu animate-popover"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">
              <Sparkles className="h-3 w-3" />
              <span>Student Profile Settings</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight font-heading">
              Edit Your Information
            </h2>
            <p className="text-xs text-zinc-400">
              Customize your profile photo, academic credentials, and career status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 py-4 overflow-y-auto pr-1 text-xs">
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

          {/* 1. PROFILE PHOTO SECTION */}
          <div className="rounded-2xl border border-zinc-800/90 bg-[#0e1014] p-4 space-y-3">
            <label className="block font-semibold text-zinc-200">
              Profile Photo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Photo / 2-Letter Initials Preview */}
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  name={name}
                  image={previewImage}
                  size="xl"
                  showRing={true}
                />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-200">
                    {previewImage ? "Custom Photo Active" : "Default 2-Letter Initials"}
                  </p>
                  <p className="text-[11px] text-zinc-500 max-w-[240px] leading-tight">
                    {previewImage
                      ? "Your photo is visible on your profile and experiences."
                      : "Without a photo, your first and last initials represent your account."}
                  </p>
                </div>
              </div>

              {/* Upload & Action Controls */}
              <div className="flex flex-wrap items-center gap-2">
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Photo</span>
                </button>

                {previewImage && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 text-zinc-300 px-3 py-2 text-xs font-medium transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Remove</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#14161c] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-2.5 py-2 text-[11px] transition-colors"
                >
                  <LinkIcon className="h-3 w-3" />
                  <span>URL</span>
                </button>
              </div>
            </div>

            {/* Optional URL input toggle */}
            {showUrlInput && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 rounded-xl border border-zinc-700 bg-[#0c0d10] px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* 2. FULL NAME */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
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
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* 3. DEPARTMENT & GRADUATION YEAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Department / Branch
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  list="department-options"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Information Technology"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm"
                />
                <datalist id="department-options">
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Graduation Year (Batch)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm cursor-pointer"
                >
                  <option value="">Select Year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      Class of {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. LINKEDIN PROFILE URL */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              LinkedIn Profile URL
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3">
                <LinkedInIcon className="h-4 w-4" />
              </div>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Enables peers and recruiters to connect with you directly.
            </p>
          </div>

          {/* 5. PLACEMENT STATUS */}
          <div className="space-y-2">
            <label className="block font-semibold text-zinc-300">
              Placement / Career Status *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(PLACEMENT_STATUS_CONFIG).map((option) => {
                const isSelected = placementStatus === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPlacementStatus(option.value)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? `${option.badgeBorder} ${option.badgeBg} ring-1 ring-blue-500/40`
                        : "border-zinc-800/80 bg-[#0c0d10] hover:border-zinc-700 hover:bg-[#15171d]"
                    }`}
                  >
                    <div className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${option.dotColor}`} />
                    <div className="space-y-0.5">
                      <p className={`font-semibold text-xs ${isSelected ? option.textColor : "text-zinc-200"}`}>
                        {option.label}
                      </p>
                      <p className="text-[11px] text-zinc-500 leading-tight">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. PLACED COMPANY & ROLE (Conditional) */}
          {placementStatus === "OFFER_ACCEPTED" && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
              <label className="block font-semibold text-emerald-300 mb-1">
                Company & Role Secured
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={placedCompany}
                  onChange={(e) => setPlacedCompany(e.target.value)}
                  placeholder="e.g. Microsoft - Software Engineer, TCS - Digital"
                  className="w-full rounded-xl border border-emerald-500/30 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-emerald-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden transition-all text-xs sm:text-sm"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Displays on your profile badge to inspire juniors and peers.
              </p>
            </div>
          )}

          {/* 7. BIO */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              Bio / Placement Advice
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short intro, your tech focus, or advice for juniors..."
                className="w-full rounded-xl border border-zinc-800 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-xs sm:text-sm resize-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-transparent px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
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
    </div>
  );
}
