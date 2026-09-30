"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Eye,
  Sparkles,
  Building2,
  Briefcase,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  saveExperienceDraftAction,
  submitExperienceAction,
  ExperienceSubmissionData,
  RoundEntry,
  QuestionEntry,
} from "@/actions/experience";
import { findOrCreateCompanyAction, findOrCreateRoleAction } from "@/actions/admin";
import { formatPlacementType, formatResultStatus } from "@/lib/utils";
import { ModernSelect, ModernSelectOption } from "@/components/modern-select";

interface WizardProps {
  companies: {
    id: string;
    name: string;
    slug: string;
    roles: { id: string; title: string; slug: string }[];
  }[];
  topics: { id: string; name: string; slug: string }[];
  initialDraft?: any | null;
  currentUserName: string;
}

const ROUND_TYPES = [
  { id: "ONLINE_ASSESSMENT", label: "Online Assessment (OA)" },
  { id: "APTITUDE", label: "Aptitude Test" },
  { id: "GROUP_DISCUSSION", label: "Group Discussion (GD)" },
  { id: "TECHNICAL", label: "Technical Interview" },
  { id: "HR", label: "HR / Behavioral Round" },
  { id: "MANAGERIAL", label: "Managerial Round" },
  { id: "OTHER", label: "Other Round" },
];

const DIFFICULTY_OPTIONS: ModernSelectOption[] = [
  { value: "EASY", label: "Easy", dotColor: "bg-emerald-400" },
  { value: "MEDIUM", label: "Medium", dotColor: "bg-amber-400" },
  { value: "HARD", label: "Hard", dotColor: "bg-rose-400" },
];

const PLACEMENT_TYPE_OPTIONS: ModernSelectOption[] = [
  { value: "CAMPUS", label: "Campus Placement", badge: "On-Campus" },
  { value: "OFF_CAMPUS", label: "Off-Campus Drive", badge: "Off-Campus" },
  { value: "REFERRAL", label: "Employee Referral", badge: "Referral" },
  { value: "INTERNSHIP", label: "Internship Hiring", badge: "Internship" },
];

const RESULT_OPTIONS: ModernSelectOption[] = [
  { value: "SELECTED", label: "Selected (Offer Accepted / Given)", dotColor: "bg-emerald-400" },
  { value: "REJECTED", label: "Rejected", dotColor: "bg-rose-400" },
  { value: "WAITLISTED", label: "Waitlisted", dotColor: "bg-amber-400" },
  { value: "PENDING", label: "Result Pending", dotColor: "bg-blue-400" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say", dotColor: "bg-zinc-400" },
];

const COMMON_HR_PROMPTS = [
  "Tell me about yourself and your background.",
  "Why do you want to join our company?",
  "Are you willing to relocate or work in rotating shifts?",
  "Tell me about a difficult challenge in a college project.",
  "Where do you see yourself in 3 to 5 years?",
];

export function ShareExperienceWizard({
  companies,
  topics,
  initialDraft,
  currentUserName,
}: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form State
  const [draftId, setDraftId] = useState<string | undefined>(initialDraft?.id);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    initialDraft?.companyId || companies[0]?.id || ""
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialDraft?.roleId || ""
  );
  const [interviewYear, setInterviewYear] = useState<number>(
    initialDraft?.interviewYear || new Date().getFullYear()
  );
  const [graduationYear, setGraduationYear] = useState<number | undefined>(
    initialDraft?.graduationYear || new Date().getFullYear() + 1
  );
  const [department, setDepartment] = useState<string>(
    initialDraft?.department || ""
  );
  const [placementType, setPlacementType] = useState<string>(
    initialDraft?.placementType || "CAMPUS"
  );

  // Rounds Selection (Step 2)
  const [selectedRounds, setSelectedRounds] = useState<string[]>(
    initialDraft?.rounds?.map((r: any) => r.roundType) || [
      "ONLINE_ASSESSMENT",
      "TECHNICAL",
      "HR",
    ]
  );

  // Round Details (Step 3)
  const [activeRoundTab, setActiveRoundTab] = useState<string>("ONLINE_ASSESSMENT");
  const [oaPlatform, setOaPlatform] = useState<string>(
    initialDraft?.rounds?.find((r: any) => r.roundType === "ONLINE_ASSESSMENT")?.platform || "HackerRank"
  );
  const [oaDuration, setOaDuration] = useState<number>(
    initialDraft?.rounds?.find((r: any) => r.roundType === "ONLINE_ASSESSMENT")?.durationMinutes || 75
  );
  const [oaSections, setOaSections] = useState<string>(
    initialDraft?.rounds?.find((r: any) => r.roundType === "ONLINE_ASSESSMENT")?.sections || ""
  );
  const [oaDifficulty, setOaDifficulty] = useState<string>(
    initialDraft?.rounds?.find((r: any) => r.roundType === "ONLINE_ASSESSMENT")?.difficulty || "MEDIUM"
  );

  // Technical Questions
  const [techQuestions, setTechQuestions] = useState<QuestionEntry[]>(
    initialDraft?.rounds?.find((r: any) => r.roundType === "TECHNICAL")?.questions?.map((q: any) => ({
      text: q.question.text,
      topicId: q.question.topicId,
      difficulty: q.question.difficulty,
      notes: q.studentNotes || "",
    })) || [
      { text: "", topicId: topics[0]?.id || "", difficulty: "MEDIUM", notes: "" },
    ]
  );

  // HR Questions
  const [hrQuestions, setHrQuestions] = useState<QuestionEntry[]>(
    initialDraft?.rounds?.find((r: any) => r.roundType === "HR")?.questions?.map((q: any) => ({
      text: q.question.text,
      notes: q.studentNotes || "",
    })) || [{ text: "Tell me about yourself and your background.", notes: "" }]
  );

  // Other Round Descriptions
  const [gdTopic, setGdTopic] = useState<string>("");
  const [managerialNotes, setManagerialNotes] = useState<string>("");
  const [aptitudeNotes, setAptitudeNotes] = useState<string>("");
  const [aptitudePlatform, setAptitudePlatform] = useState<string>("CoCubes / AMCAT");
  const [aptitudeDuration, setAptitudeDuration] = useState<number>(60);

  // Sync activeRoundTab with selectedRounds
  useEffect(() => {
    if (selectedRounds.length > 0 && !selectedRounds.includes(activeRoundTab)) {
      setActiveRoundTab(selectedRounds[0]);
    }
  }, [selectedRounds, activeRoundTab]);

  // Round completion check for smart visual indicators
  const isRoundCompleted = (rType: string) => {
    if (rType === "ONLINE_ASSESSMENT") {
      return Boolean(oaPlatform.trim() || oaSections.trim());
    }
    if (rType === "TECHNICAL") {
      return techQuestions.some((q) => q.text.trim().length > 0);
    }
    if (rType === "HR") {
      return hrQuestions.some((q) => q.text.trim().length > 0);
    }
    if (rType === "GROUP_DISCUSSION") {
      return Boolean(gdTopic.trim());
    }
    if (rType === "MANAGERIAL" || rType === "OTHER") {
      return Boolean(managerialNotes.trim());
    }
    if (rType === "APTITUDE") {
      return Boolean(aptitudeNotes.trim() || aptitudePlatform.trim());
    }
    return false;
  };

  // Step 3 Round Navigation Calculations
  const currentRoundIdx = selectedRounds.indexOf(activeRoundTab);
  const hasNextRoundInStep3 =
    step === 3 &&
    currentRoundIdx >= 0 &&
    currentRoundIdx < selectedRounds.length - 1;
  const hasPrevRoundInStep3 = step === 3 && currentRoundIdx > 0;
  const nextRoundType = hasNextRoundInStep3
    ? selectedRounds[currentRoundIdx + 1]
    : null;
  const nextRoundLabel = nextRoundType
    ? ROUND_TYPES.find((r) => r.id === nextRoundType)?.label || nextRoundType
    : null;
  const prevRoundType = hasPrevRoundInStep3
    ? selectedRounds[currentRoundIdx - 1]
    : null;
  const prevRoundLabel = prevRoundType
    ? ROUND_TYPES.find((r) => r.id === prevRoundType)?.label || prevRoundType
    : null;

  // Step 4: Narrative & Advice
  const [overallExperience, setOverallExperience] = useState<string>(
    initialDraft?.overallExperience || ""
  );
  const [advice, setAdvice] = useState<string>(initialDraft?.advice || "");

  // Step 5: Result & Privacy
  const [result, setResult] = useState<string>(initialDraft?.result || "SELECTED");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    initialDraft?.isAnonymous ?? false
  );

  // Dynamic company list & role creation state
  const [companyList, setCompanyList] = useState(companies);
  const [isAddingNewCompany, setIsAddingNewCompany] = useState(false);
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [companyCreationLoading, setCompanyCreationLoading] = useState(false);

  const [isAddingNewRole, setIsAddingNewRole] = useState(false);
  const [customRoleTitle, setCustomRoleTitle] = useState("");
  const [roleCreationLoading, setRoleCreationLoading] = useState(false);
  const [roleCreationError, setRoleCreationError] = useState<string | null>(null);

  // Derive active company's roles
  const activeCompany = companyList.find((c) => c.id === selectedCompanyId) || companyList[0];
  const activeRoles = activeCompany?.roles || [];

  // Auto-set role if not selected or mismatched
  if (
    !isAddingNewRole &&
    activeRoles.length > 0 &&
    (!selectedRoleId || !activeRoles.some((r) => r.id === selectedRoleId))
  ) {
    setSelectedRoleId(activeRoles[0].id);
  }

  const handleAddNewCompany = async () => {
    if (!customCompanyName.trim()) return;
    setCompanyCreationLoading(true);
    const res = await findOrCreateCompanyAction(customCompanyName.trim());
    setCompanyCreationLoading(false);
    if (res?.company) {
      const newComp = { ...res.company, roles: res.company.roles || [] };
      setCompanyList((prev) => [...prev, newComp]);
      setSelectedCompanyId(newComp.id);
      setIsAddingNewCompany(false);
      setCustomCompanyName("");
      setIsAddingNewRole(true);
    }
  };

  const handleAddNewRole = async (): Promise<string | null> => {
    if (!customRoleTitle.trim() || !selectedCompanyId) return null;
    setRoleCreationLoading(true);
    setRoleCreationError(null);
    const res = await findOrCreateRoleAction(selectedCompanyId, customRoleTitle.trim());
    setRoleCreationLoading(false);
    if (res?.error) {
      setRoleCreationError(res.error);
      return null;
    } else if (res?.role) {
      setCompanyList((prev) =>
        prev.map((c) => {
          if (c.id === selectedCompanyId) {
            const exists = c.roles.some((r) => r.id === res.role.id);
            return exists ? c : { ...c, roles: [...c.roles, res.role] };
          }
          return c;
        })
      );
      setSelectedRoleId(res.role.id);
      setIsAddingNewRole(false);
      setCustomRoleTitle("");
      return res.role.id;
    }
    return null;
  };

  // Toggle rounds
  const toggleRoundSelection = (roundType: string) => {
    if (selectedRounds.includes(roundType)) {
      setSelectedRounds(selectedRounds.filter((r) => r !== roundType));
    } else {
      setSelectedRounds([...selectedRounds, roundType]);
    }
  };

  // Compile full submission data payload
  const buildPayload = (): ExperienceSubmissionData => {
    const rounds: RoundEntry[] = [];
    let orderIndex = 1;

    for (const rType of selectedRounds) {
      if (rType === "ONLINE_ASSESSMENT") {
        rounds.push({
          roundType: "ONLINE_ASSESSMENT",
          roundName: "Online Assessment",
          orderIndex: orderIndex++,
          platform: oaPlatform,
          durationMinutes: Number(oaDuration),
          sections: oaSections,
          difficulty: oaDifficulty,
        });
      } else if (rType === "TECHNICAL") {
        rounds.push({
          roundType: "TECHNICAL",
          roundName: "Technical Interview",
          orderIndex: orderIndex++,
          questions: techQuestions.filter((q) => q.text.trim().length > 0),
        });
      } else if (rType === "HR") {
        rounds.push({
          roundType: "HR",
          roundName: "HR Interview",
          orderIndex: orderIndex++,
          questions: hrQuestions.filter((q) => q.text.trim().length > 0),
        });
      } else if (rType === "GROUP_DISCUSSION") {
        rounds.push({
          roundType: "GROUP_DISCUSSION",
          roundName: "Group Discussion",
          orderIndex: orderIndex++,
          description: gdTopic,
        });
      } else if (rType === "MANAGERIAL") {
        rounds.push({
          roundType: "MANAGERIAL",
          roundName: "Managerial Round",
          orderIndex: orderIndex++,
          description: managerialNotes,
        });
      } else if (rType === "APTITUDE") {
        rounds.push({
          roundType: "APTITUDE",
          roundName: "Aptitude Test",
          orderIndex: orderIndex++,
          platform: aptitudePlatform,
          durationMinutes: Number(aptitudeDuration),
          description: aptitudeNotes,
        });
      } else {
        rounds.push({
          roundType: rType,
          roundName: ROUND_TYPES.find((r) => r.id === rType)?.label || "Other Round",
          orderIndex: orderIndex++,
        });
      }
    }

    return {
      id: draftId,
      companyId: selectedCompanyId,
      roleId: selectedRoleId,
      interviewYear: Number(interviewYear),
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      department: department.trim() || undefined,
      placementType,
      result,
      overallExperience,
      advice,
      isAnonymous,
      rounds,
    };
  };

  // Save Draft Handler
  const handleSaveDraft = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const payload = buildPayload();
      const res = await saveExperienceDraftAction(payload);
      if (res?.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setDraftId(res.experienceId);
        setStatusMessage({
          type: "success",
          text: "Draft saved successfully. You can safely leave and resume anytime from your profile.",
        });
      }
    });
  };

  // Final Submit Handler
  const handleSubmitExperience = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const payload = buildPayload();
      const res = await submitExperienceAction(payload);
      if (res?.error) {
        setStatusMessage({ type: "error", text: res.error });
      } else {
        setStatusMessage({
          type: "success",
          text: "Experience added successfully! Marked as 'Unverified' on top. Redirecting to your live experience...",
        });
        setTimeout(() => {
          if (res?.slug) {
            router.push(`/experiences/${res.slug}`);
          } else {
            router.push("/profile");
          }
          router.refresh();
        }, 1200);
      }
    });
  };

  const stepsList = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Rounds" },
    { num: 3, label: "Round Details" },
    { num: 4, label: "Experience & Advice" },
    { num: 5, label: "Result & Privacy" },
    { num: 6, label: "Preview & Submit" },
  ];

  return (
    <div className="space-y-8">
      {/* Streamlined Step Progress Bar */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto gap-2 text-xs no-scrollbar">
          {stepsList.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 py-1.5 px-3 rounded-xl font-medium shrink-0 transition-all ${
                step === s.num
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20"
                  : step > s.num
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-stone-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                  step === s.num
                    ? "bg-white text-blue-600"
                    : step > s.num
                    ? "bg-emerald-500 text-white"
                    : "border border-stone-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div
          className={`rounded-2xl p-4 text-xs sm:text-sm flex items-start gap-3 border shadow-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* STEP 1: BASIC INFO */}
      {step === 1 && (
        <div className="space-y-6 bg-white dark:bg-[#111317] border border-stone-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="border-b border-stone-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
              Step 1: Placement & Company Info
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Identify the hiring company, role title, placement drive year, and category.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            {/* Company Selection & On-the-fly Creation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-slate-700 dark:text-zinc-300">
                  Company *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCompany(!isAddingNewCompany)}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  {isAddingNewCompany ? "Select existing company" : "+ Add new company"}
                </button>
              </div>

              {isAddingNewCompany ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCompanyName}
                    onChange={(e) => setCustomCompanyName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNewCompany();
                      }
                    }}
                    placeholder="Enter company name..."
                    className="flex-1 rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCompany}
                    disabled={companyCreationLoading}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white shrink-0"
                  >
                    {companyCreationLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              ) : (
                <ModernSelect
                  value={selectedCompanyId}
                  onChange={(val) => {
                    setSelectedCompanyId(val);
                    setIsAddingNewRole(false);
                  }}
                  options={companyList.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Select Company"
                />
              )}
            </div>

            {/* Role Selection & On-the-fly Creation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-slate-700 dark:text-zinc-300">
                  Role *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewRole(!isAddingNewRole)}
                  className="text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  {isAddingNewRole ? "Select from list" : "+ Create new role"}
                </button>
              </div>

              {isAddingNewRole || activeRoles.length === 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customRoleTitle}
                      onChange={(e) => setCustomRoleTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewRole();
                        }
                      }}
                      placeholder="e.g. SRE Intern, Full Stack Developer..."
                      className="flex-1 rounded-xl border border-zinc-700 bg-[#0c0d10] px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddNewRole}
                      disabled={roleCreationLoading}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white shrink-0"
                    >
                      {roleCreationLoading ? "Saving..." : "Save Role"}
                    </button>
                  </div>
                  {roleCreationError && (
                    <p className="text-xs text-rose-400 font-medium">{roleCreationError}</p>
                  )}
                  {activeRoles.length === 0 && (
                    <p className="text-[11px] text-zinc-400">
                      No roles exist for this company yet. Type your role title above.
                    </p>
                  )}
                </div>
              ) : (
                <ModernSelect
                  value={selectedRoleId}
                  onChange={(val) => {
                    if (val === "__NEW__") {
                      setIsAddingNewRole(true);
                    } else {
                      setSelectedRoleId(val);
                    }
                  }}
                  options={[
                    ...activeRoles.map((r) => ({ value: r.id, label: r.title })),
                    { value: "__NEW__", label: "+ Add a custom / new role...", badge: "Custom" },
                  ]}
                  placeholder="Select Role"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Interview Year * (When the interview took place)
              </label>
              <input
                type="number"
                value={interviewYear}
                onChange={(e) => setInterviewYear(Number(e.target.value))}
                min={2020}
                max={2030}
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                Used for filtering and hiring timelines.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Graduation Year (Your college batch)
              </label>
              <input
                type="number"
                value={graduationYear || ""}
                onChange={(e) => setGraduationYear(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 2027"
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                Metadata only (separate from interview year).
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Department / Branch
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Information Technology"
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Placement Type *
              </label>
              <ModernSelect
                value={placementType}
                onChange={(val) => setPlacementType(val)}
                options={PLACEMENT_TYPE_OPTIONS}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ROUNDS SELECTION */}
      {step === 2 && (
        <div className="space-y-6 bg-white dark:bg-[#111317] border border-stone-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="border-b border-stone-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
              Step 2: Selection Rounds Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Select all evaluation stages you participated in during this drive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ROUND_TYPES.map((r) => {
              const isSelected = selectedRounds.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRoundSelection(r.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10 text-slate-900 dark:text-zinc-100 shadow-sm"
                      : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#16181e] text-slate-600 dark:text-zinc-400 hover:border-blue-500/40"
                  }`}
                >
                  <span className="text-sm font-semibold">{r.label}</span>
                  <div
                    className={`h-5 w-5 rounded-lg flex items-center justify-center border text-xs font-bold ${
                      isSelected
                        ? "bg-blue-600 text-white border-transparent shadow-sm shadow-blue-500/30"
                        : "border-stone-300 dark:border-zinc-700"
                    }`}
                  >
                    {isSelected && "✓"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: ROUND DETAILS */}
      {step === 3 && (
        <div className="space-y-6 bg-white dark:bg-[#111317] border border-stone-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="border-b border-stone-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
              Step 3: Round Details & Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Provide specific questions, test platforms, and topics asked in each round of your selection process.
            </p>
          </div>

          {/* Sub-tabs for selected rounds with progress badge */}
          <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
            {selectedRounds.map((rType, idx) => {
              const label = ROUND_TYPES.find((r) => r.id === rType)?.label || rType;
              const isActive = activeRoundTab === rType;
              const completed = isRoundCompleted(rType);

              return (
                <button
                  key={rType}
                  type="button"
                  onClick={() => setActiveRoundTab(rType)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30"
                      : "bg-[#16181e] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white text-blue-600"
                        : completed
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {completed && !isActive ? "✓" : idx + 1}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* OA TAB */}
          {activeRoundTab === "ONLINE_ASSESSMENT" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Assessment Platform
                  </label>
                  <input
                    type="text"
                    value={oaPlatform}
                    onChange={(e) => setOaPlatform(e.target.value)}
                    placeholder="e.g. HackerRank, AMCAT, Mettl"
                    className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={oaDuration}
                    onChange={(e) => setOaDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Difficulty
                  </label>
                  <ModernSelect
                    value={oaDifficulty}
                    onChange={(val) => setOaDifficulty(val)}
                    options={DIFFICULTY_OPTIONS}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Test Sections & Breakdown
                </label>
                <input
                  type="text"
                  value={oaSections}
                  onChange={(e) => setOaSections(e.target.value)}
                  placeholder="e.g. Aptitude (20 Qs), Technical Networking & OS (30 Qs), 2 Coding Problems"
                  className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Round footer navigation prompt */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">
                  Round {currentRoundIdx + 1} of {selectedRounds.length}:{" "}
                  <span className="text-zinc-200 font-semibold">
                    Online Assessment (OA)
                  </span>
                </span>
                {hasNextRoundInStep3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoundTab(selectedRounds[currentRoundIdx + 1]);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="rounded-xl bg-blue-600/10 border border-blue-500/30 hover:border-blue-500/60 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Proceed to {nextRoundLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TECHNICAL INTERVIEW TAB */}
          {activeRoundTab === "TECHNICAL" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
                    Technical Questions Asked
                  </span>
                  <p className="text-xs text-zinc-400">
                    Add specific programming, conceptual, or problem-solving questions.
                  </p>
                </div>
                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">
                  {techQuestions.length} {techQuestions.length === 1 ? "Question" : "Questions"}
                </span>
              </div>

              <div className="space-y-3.5">
                {techQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-800 bg-[#14161e]/90 p-4 sm:p-5 space-y-3.5 text-xs shadow-sm hover:border-zinc-700/80 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/15 text-blue-400 font-bold text-[11px]">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-zinc-200 text-xs">
                          Question Details
                        </span>
                      </div>
                      {techQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setTechQuestions(techQuestions.filter((_, i) => i !== idx))
                          }
                          className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...techQuestions];
                        updated[idx].text = e.target.value;
                        setTechQuestions(updated);
                      }}
                      placeholder="e.g. What is DNS and how does resolution work?"
                      className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-hidden text-sm"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Topic
                        </label>
                        <ModernSelect
                          value={q.topicId || topics[0]?.id || ""}
                          onChange={(val) => {
                            const updated = [...techQuestions];
                            updated[idx].topicId = val;
                            setTechQuestions(updated);
                          }}
                          options={topics.map((t) => ({ value: t.id, label: t.name }))}
                          placeholder="Select Topic"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Difficulty
                        </label>
                        <ModernSelect
                          value={q.difficulty || "MEDIUM"}
                          onChange={(val) => {
                            const updated = [...techQuestions];
                            updated[idx].difficulty = val;
                            setTechQuestions(updated);
                          }}
                          options={DIFFICULTY_OPTIONS}
                        />
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      value={q.notes || ""}
                      onChange={(e) => {
                        const updated = [...techQuestions];
                        updated[idx].notes = e.target.value;
                        setTechQuestions(updated);
                      }}
                      placeholder="Optional notes: How did you approach it? Follow-up questions asked by the interviewer?"
                      className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] p-3 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-hidden text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Add Question Button - Located BELOW the questions list as requested */}
              <button
                type="button"
                onClick={() =>
                  setTechQuestions([
                    ...techQuestions,
                    { text: "", topicId: topics[0]?.id || "", difficulty: "MEDIUM", notes: "" },
                  ])
                }
                className="w-full py-3 px-4 rounded-2xl border border-dashed border-zinc-700/80 hover:border-blue-500/60 bg-[#16181e]/60 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 group shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span>Add Another Technical Question</span>
              </button>

              {/* Round footer navigation prompt */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">
                  Round {currentRoundIdx + 1} of {selectedRounds.length}:{" "}
                  <span className="text-zinc-200 font-semibold">
                    Technical Interview
                  </span>
                </span>
                {hasNextRoundInStep3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoundTab(selectedRounds[currentRoundIdx + 1]);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="rounded-xl bg-blue-600/10 border border-blue-500/30 hover:border-blue-500/60 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Proceed to {nextRoundLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* HR INTERVIEW TAB */}
          {activeRoundTab === "HR" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
                    HR Questions Asked
                  </span>
                  <p className="text-xs text-zinc-400">
                    Behavioral, cultural fit, and situational questions.
                  </p>
                </div>
                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">
                  {hrQuestions.length} {hrQuestions.length === 1 ? "Question" : "Questions"}
                </span>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-500">Quick add:</span>
                {COMMON_HR_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      if (!hrQuestions.some((q) => q.text === prompt)) {
                        setHrQuestions([...hrQuestions, { text: prompt, notes: "" }]);
                      }
                    }}
                    className="rounded-full border border-zinc-800 bg-[#16181e] px-2.5 py-1 hover:border-blue-500/50 hover:text-blue-400 text-zinc-300 transition-colors text-[11px] cursor-pointer"
                  >
                    + {prompt.slice(0, 28)}...
                  </button>
                ))}
              </div>

              <div className="space-y-3.5">
                {hrQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-800 bg-[#14161e]/90 p-4 sm:p-5 space-y-3.5 text-xs shadow-sm hover:border-zinc-700/80 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/15 text-blue-400 font-bold text-[11px]">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-zinc-200 text-xs">
                          HR Question
                        </span>
                      </div>
                      {hrQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setHrQuestions(hrQuestions.filter((_, i) => i !== idx))
                          }
                          className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...hrQuestions];
                        updated[idx].text = e.target.value;
                        setHrQuestions(updated);
                      }}
                      placeholder="e.g. Why should we hire you?"
                      className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-hidden text-sm"
                    />
                    <textarea
                      rows={2}
                      value={q.notes || ""}
                      onChange={(e) => {
                        const updated = [...hrQuestions];
                        updated[idx].notes = e.target.value;
                        setHrQuestions(updated);
                      }}
                      placeholder="Candidate notes or how the conversation unfolded..."
                      className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] p-3 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-hidden text-xs"
                    />
                  </div>
                ))}
              </div>

              {/* Add Question Button - Located BELOW the questions list as requested */}
              <button
                type="button"
                onClick={() =>
                  setHrQuestions([...hrQuestions, { text: "", notes: "" }])
                }
                className="w-full py-3 px-4 rounded-2xl border border-dashed border-zinc-700/80 hover:border-blue-500/60 bg-[#16181e]/60 hover:bg-blue-500/5 text-zinc-300 hover:text-blue-400 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 group shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <span>Add Another HR Question</span>
              </button>

              {/* Round footer navigation prompt */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">
                  Round {currentRoundIdx + 1} of {selectedRounds.length}:{" "}
                  <span className="text-zinc-200 font-semibold">
                    HR Interview
                  </span>
                </span>
                {hasNextRoundInStep3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoundTab(selectedRounds[currentRoundIdx + 1]);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="rounded-xl bg-blue-600/10 border border-blue-500/30 hover:border-blue-500/60 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Proceed to {nextRoundLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* APTITUDE TEST TAB */}
          {activeRoundTab === "APTITUDE" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Testing Platform
                  </label>
                  <input
                    type="text"
                    value={aptitudePlatform}
                    onChange={(e) => setAptitudePlatform(e.target.value)}
                    placeholder="e.g. AMCAT, CoCubes, Mettl"
                    className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={aptitudeDuration}
                    onChange={(e) => setAptitudeDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                    Overall Difficulty
                  </label>
                  <ModernSelect
                    value={oaDifficulty}
                    onChange={(val) => setOaDifficulty(val)}
                    options={DIFFICULTY_OPTIONS}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Aptitude Sections & Topic Breakdown
                </label>
                <textarea
                  rows={3}
                  value={aptitudeNotes}
                  onChange={(e) => setAptitudeNotes(e.target.value)}
                  placeholder="e.g. Quantitative (P&L, Probability), Logical Reasoning (Syllogisms, Blood Relations), Verbal (Reading Comprehension)"
                  className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] p-3.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Round footer navigation prompt */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">
                  Round {currentRoundIdx + 1} of {selectedRounds.length}:{" "}
                  <span className="text-zinc-200 font-semibold">Aptitude Test</span>
                </span>
                {hasNextRoundInStep3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoundTab(selectedRounds[currentRoundIdx + 1]);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="rounded-xl bg-blue-600/10 border border-blue-500/30 hover:border-blue-500/60 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Proceed to {nextRoundLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* GROUP DISCUSSION */}
          {activeRoundTab === "GROUP_DISCUSSION" && (
            <div className="text-xs sm:text-sm space-y-4">
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700 dark:text-zinc-300">
                  GD Topic & Evaluation Focus
                </label>
                <textarea
                  rows={4}
                  value={gdTopic}
                  onChange={(e) => setGdTopic(e.target.value)}
                  placeholder="What was the topic? How many candidates participated? What evaluation criteria were emphasized?"
                  className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] p-3.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Round footer navigation prompt */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">
                  Round {currentRoundIdx + 1} of {selectedRounds.length}:{" "}
                  <span className="text-zinc-200 font-semibold">Group Discussion</span>
                </span>
                {hasNextRoundInStep3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoundTab(selectedRounds[currentRoundIdx + 1]);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="rounded-xl bg-blue-600/10 border border-blue-500/30 hover:border-blue-500/60 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Proceed to {nextRoundLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MANAGERIAL / OTHER */}
          {(activeRoundTab === "MANAGERIAL" || activeRoundTab === "OTHER") && (
            <div className="text-xs sm:text-sm space-y-4">
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700 dark:text-zinc-300">
                  Round Notes & Topics Discussed
                </label>
                <textarea
                  rows={4}
                  value={managerialNotes}
                  onChange={(e) => setManagerialNotes(e.target.value)}
                  placeholder="Describe the nature of this round, role expectations discussed, leadership questions asked..."
                  className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] p-3.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Round footer navigation prompt */}
              <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">
                  Round {currentRoundIdx + 1} of {selectedRounds.length}:{" "}
                  <span className="text-zinc-200 font-semibold">
                    {ROUND_TYPES.find((r) => r.id === activeRoundTab)?.label || activeRoundTab}
                  </span>
                </span>
                {hasNextRoundInStep3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRoundTab(selectedRounds[currentRoundIdx + 1]);
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }}
                    className="rounded-xl bg-blue-600/10 border border-blue-500/30 hover:border-blue-500/60 px-4 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600 hover:text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Proceed to {nextRoundLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: EXPERIENCE NARRATIVE & ADVICE */}
      {step === 4 && (
        <div className="space-y-6 bg-white dark:bg-[#111317] border border-stone-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="border-b border-stone-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
              Step 4: Overall Narrative & Junior Advice
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Share the full narrative of your interview drive and actionable preparation advice.
            </p>
          </div>

          <div className="space-y-5 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Describe your interview experience in detail *
              </label>
              <textarea
                rows={8}
                value={overallExperience}
                onChange={(e) => setOverallExperience(e.target.value)}
                placeholder="Walk through the day from initial briefing to the final round. Note difficulty, atmosphere, and important learnings..."
                className="w-full rounded-2xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] p-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                {overallExperience.length} characters (minimum 20 characters)
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                What advice would you give to juniors preparing for this role?
              </label>
              <textarea
                rows={4}
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="What topics should they focus on? What mistakes should they avoid? Mention any specific practice resources..."
                className="w-full rounded-2xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] p-4 text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: RESULT & PRIVACY */}
      {step === 5 && (
        <div className="space-y-6 bg-white dark:bg-[#111317] border border-stone-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="border-b border-stone-100 dark:border-zinc-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">
              Step 5: Outcome & Author Privacy
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
              Select your final recruitment outcome and configure name attribution.
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                Interview Result *
              </label>
              <div className="max-w-sm">
                <ModernSelect
                  value={result}
                  onChange={(val) => setResult(val)}
                  options={RESULT_OPTIONS}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-zinc-800 space-y-3">
              <label className="block font-semibold text-slate-700 dark:text-zinc-300">
                Author Attribution
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  !isAnonymous
                    ? "border-blue-500 bg-blue-500/10 text-slate-900 dark:text-zinc-100"
                    : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#16181e] text-slate-600 dark:text-zinc-400"
                }`}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={!isAnonymous}
                    onChange={() => setIsAnonymous(false)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-semibold">
                    Display my name ({currentUserName})
                  </span>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  isAnonymous
                    ? "border-blue-500 bg-blue-500/10 text-slate-900 dark:text-zinc-100"
                    : "border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#16181e] text-slate-600 dark:text-zinc-400"
                }`}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={isAnonymous}
                    onChange={() => setIsAnonymous(true)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="font-semibold">
                    Post anonymously ("Anonymous Student")
                  </span>
                </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2">
                Your email is always private and never displayed publicly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: PREVIEW & SUBMIT */}
      {step === 6 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111317] border border-stone-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-stone-100 dark:border-zinc-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                Experience Preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 mt-1">
                {activeRoles.find((r) => r.id === selectedRoleId)?.title || "Role"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                {activeCompany?.name} · {interviewYear} · {formatPlacementType(placementType)} ·{" "}
                {isAnonymous ? "Anonymous Student" : currentUserName}
              </p>
            </div>

            {/* Selection Process preview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Selection Process Pipeline
              </h3>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                {selectedRounds.map((r, i) => (
                  <span
                    key={r}
                    className="rounded-full bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 px-3 py-1"
                  >
                    {i + 1}. {ROUND_TYPES.find((item) => item.id === r)?.label || r}
                  </span>
                ))}
              </div>
            </div>

            {/* Technical questions preview */}
            {selectedRounds.includes("TECHNICAL") && techQuestions.filter((q) => q.text).length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Technical Questions ({techQuestions.filter((q) => q.text).length})
                </h3>
                <div className="divide-y divide-stone-100 dark:divide-zinc-800/80 border border-stone-200 dark:border-zinc-800/90 rounded-2xl bg-stone-50/50 dark:bg-[#16181e] overflow-hidden text-xs">
                  {techQuestions.filter((q) => q.text).map((q, idx) => (
                    <div key={idx} className="p-4">
                      <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{idx + 1}. {q.text}</p>
                      {q.notes && <p className="text-slate-600 dark:text-zinc-400 mt-1 pl-3 border-l-2 border-blue-500">{q.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Experience preview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Overall Experience Narrative
              </h3>
              <div className="rounded-2xl bg-stone-50 dark:bg-[#16181e] p-5 text-sm text-slate-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed border border-stone-200 dark:border-zinc-800">
                {overallExperience || "(No overall narrative entered yet)"}
              </div>
            </div>

            {/* Advice preview */}
            {advice && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Advice for Juniors
                </h3>
                <div className="rounded-2xl bg-emerald-500/5 dark:bg-[#16181e] p-5 text-sm text-slate-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed border border-emerald-500/20">
                  {advice}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons Row */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                if (step === 3 && hasPrevRoundInStep3) {
                  setActiveRoundTab(selectedRounds[currentRoundIdx - 1]);
                  window.scrollTo({ top: 120, behavior: "smooth" });
                  return;
                }
                setStep(step - 1);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-blue-500/50 hover:text-blue-500 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>
                {step === 3 && hasPrevRoundInStep3
                  ? `Back: ${prevRoundLabel}`
                  : "Previous"}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending}
            className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-blue-500/50 hover:text-blue-500 inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Save as private draft to resume later"
          >
            <Save className="h-4 w-4 text-blue-500" />
            <span>Save Draft</span>
          </button>
        </div>

        <div>
          {step < 6 ? (
            <button
              type="button"
              onClick={async () => {
                if (step === 1 && isAddingNewRole && customRoleTitle.trim()) {
                  await handleAddNewRole();
                }
                if (step === 3 && hasNextRoundInStep3) {
                  setActiveRoundTab(selectedRounds[currentRoundIdx + 1]);
                  window.scrollTo({ top: 120, behavior: "smooth" });
                  return;
                }
                setStep(step + 1);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 active:scale-95 inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>
                {step === 3 && hasNextRoundInStep3
                  ? `Next: ${nextRoundLabel}`
                  : step === 3
                  ? "Continue to Experience"
                  : "Continue"}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitExperience}
              disabled={isPending}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isPending ? "Submitting..." : "Submit Experience for Review"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
