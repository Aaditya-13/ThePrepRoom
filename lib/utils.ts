import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatPlacementType(type: string): string {
  switch (type) {
    case "CAMPUS":
      return "Campus Placement";
    case "OFF_CAMPUS":
      return "Off-campus";
    case "REFERRAL":
      return "Referral";
    case "INTERNSHIP":
      return "Internship";
    default:
      return type;
  }
}

export function formatRoundType(type: string): string {
  switch (type) {
    case "ONLINE_ASSESSMENT":
      return "Online Assessment";
    case "APTITUDE":
      return "Aptitude Test";
    case "GROUP_DISCUSSION":
      return "Group Discussion";
    case "TECHNICAL":
      return "Technical Interview";
    case "HR":
      return "HR Interview";
    case "MANAGERIAL":
      return "Managerial Round";
    case "OTHER":
      return "Other Round";
    default:
      return type;
  }
}

export function formatResultStatus(result: string): { label: string; badgeClass: string } {
  switch (result) {
    case "SELECTED":
      return {
        label: "Selected",
        badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
      };
    case "WAITLISTED":
      return {
        label: "Waitlisted",
        badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      };
    case "PENDING":
      return {
        label: "Result Pending",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      };
    case "PREFER_NOT_TO_SAY":
      return {
        label: "Result Undisclosed",
        badgeClass: "bg-slate-50 text-slate-600 border-slate-200",
      };
    default:
      return {
        label: result,
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      };
  }
}
