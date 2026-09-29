"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Briefcase,
  X,
  Save,
} from "lucide-react";
import { updateUserProfileAction } from "@/actions/user";
import { PLACEMENT_STATUS_CONFIG, COMMON_DEPARTMENTS } from "@/lib/profile-constants";

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
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
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ user, isOpen, onClose }: ProfileEditFormProps) {
  const router = useRouter();
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

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

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

    startTransition(async () => {
      const res = await updateUserProfileAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Profile updated successfully!");
        router.refresh();
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    });
  };

  const currentGradYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentGradYear - 2 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-zinc-800 bg-[#111317] p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 shrink-0 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">
              <Sparkles className="h-3 w-3" />
              <span>Student Profile Settings</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Edit Your Information
            </h2>
            <p className="text-xs text-zinc-400">
              Update your academic details, placement journey status, and professional links.
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

        {/* Form Body */}
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

          {/* Full Name */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ved Kalantri"
                className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
              />
            </div>
          </div>

          {/* Department & Graduation Year Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Department / Branch
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  list="department-options"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Information Technology"
                  className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
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
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <select
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm cursor-pointer"
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

          {/* LinkedIn Profile URL */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              LinkedIn Profile URL
            </label>
            <div className="relative">
              <LinkedInIcon className="absolute left-3 top-3 h-4 w-4" />
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Enables peers and recruiters to connect with you directly from your shared experiences.
            </p>
          </div>

          {/* Placement Status (Interactive Selection Cards) */}
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
                    className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? `${option.badgeBorder} ${option.badgeBg} ring-1 ring-blue-500/40`
                        : "border-zinc-800 bg-[#0c0d10]/70 hover:border-zinc-700 hover:bg-[#16181e]"
                    }`}
                  >
                    <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${option.dotColor}`} />
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

          {/* Placed Company & Role (Shows only if OFFER_ACCEPTED is selected) */}
          {placementStatus === "OFFER_ACCEPTED" && (
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2 animate-in fade-in duration-200">
              <label className="block font-semibold text-emerald-300 mb-1">
                Company & Role Secured (Optional)
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  value={placedCompany}
                  onChange={(e) => setPlacedCompany(e.target.value)}
                  placeholder="e.g. Microsoft - Software Engineer, TCS - Digital"
                  className="w-full rounded-xl border border-emerald-500/30 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-emerald-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden transition-all text-sm"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Displays on your profile badge to inspire juniors and peers.
              </p>
            </div>
          )}

          {/* Bio / About */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              Bio / Placement Advice
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short intro, your tech focus, or advice for juniors..."
                className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-transparent px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>{isPending ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
