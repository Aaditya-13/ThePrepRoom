export interface PlacementOption {
  value: string;
  label: string;
  shortLabel: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  description: string;
}

export const PLACEMENT_STATUS_CONFIG: Record<string, PlacementOption> = {
  OFFER_ACCEPTED: {
    value: "OFFER_ACCEPTED",
    label: "Offer Secured (Placed)",
    shortLabel: "Offer Secured",
    dotColor: "bg-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    textColor: "text-emerald-400",
    description: "Has received and accepted a placement or job offer",
  },
  ACTIVELY_INTERVIEWING: {
    value: "ACTIVELY_INTERVIEWING",
    label: "In Placement Drives / Interviewing",
    shortLabel: "In Drives",
    dotColor: "bg-blue-400",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/30",
    textColor: "text-blue-400",
    description: "Currently appearing for campus or off-campus recruitment drives",
  },
  PREPARING: {
    value: "PREPARING",
    label: "Preparing & Upskilling",
    shortLabel: "Preparing",
    dotColor: "bg-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    textColor: "text-amber-400",
    description: "Focusing on DSA, technical prep, and core subjects",
  },
  SEEKING_INTERNSHIP: {
    value: "SEEKING_INTERNSHIP",
    label: "Seeking Internship",
    shortLabel: "Seeking Internship",
    dotColor: "bg-purple-400",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/30",
    textColor: "text-purple-400",
    description: "Looking for summer or pre-final year internship roles",
  },
  HIGHER_STUDIES: {
    value: "HIGHER_STUDIES",
    label: "Higher Studies / Research",
    shortLabel: "Higher Studies",
    dotColor: "bg-teal-400",
    badgeBg: "bg-teal-500/10",
    badgeBorder: "border-teal-500/30",
    textColor: "text-teal-400",
    description: "Aiming for MS, M.Tech, MBA, or specialized research",
  },
};

export const COMMON_DEPARTMENTS = [
  "Information Technology",
  "Computer Engineering",
  "Computer Science & Engineering",
  "Artificial Intelligence & Data Science",
  "Electronics & Telecommunication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Instrumentation Engineering",
];
