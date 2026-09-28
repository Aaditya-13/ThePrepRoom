"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import {
  saveExperienceDraftAction,
  submitExperienceAction,
  ExperienceSubmissionData,
  RoundEntry,
  QuestionEntry,
} from "@/actions/experience";
import { formatPlacementType, formatResultStatus } from "@/lib/utils";

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

  // Derive active company's roles
  const activeCompany = companies.find((c) => c.id === selectedCompanyId);
  const activeRoles = activeCompany?.roles || [];

  // Auto-set role if not selected or mismatched
  if (activeRoles.length > 0 && (!selectedRoleId || !activeRoles.some((r) => r.id === selectedRoleId))) {
    setSelectedRoleId(activeRoles[0].id);
  }

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
          text: "Experience submitted for review! Redirecting to your profile...",
        });
        setTimeout(() => {
          router.push("/profile");
          router.refresh();
        }, 1500);
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
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Company *</label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">Role *</label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
              >
                {activeRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
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
              <select
                value={placementType}
                onChange={(e) => setPlacementType(e.target.value)}
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="CAMPUS">Campus Placement</option>
                <option value="OFF_CAMPUS">Off-Campus</option>
                <option value="REFERRAL">Referral</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
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
              Provide specific questions, test platforms, and topics asked in each round.
            </p>
          </div>

          {/* Sub-tabs for selected rounds */}
          <div className="flex flex-wrap gap-2 border-b border-stone-100 dark:border-zinc-800 pb-3">
            {selectedRounds.map((rType) => {
              const label = ROUND_TYPES.find((r) => r.id === rType)?.label || rType;
              return (
                <button
                  key={rType}
                  type="button"
                  onClick={() => setActiveRoundTab(rType)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    activeRoundTab === rType
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-stone-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {label}
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
                  <select
                    value={oaDifficulty}
                    onChange={(e) => setOaDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
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
            </div>
          )}

          {/* TECHNICAL INTERVIEW TAB */}
          {activeRoundTab === "TECHNICAL" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  Technical Questions Asked
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setTechQuestions([
                      ...techQuestions,
                      { text: "", topicId: topics[0]?.id || "", difficulty: "MEDIUM", notes: "" },
                    ])
                  }
                  className="rounded-xl bg-blue-600/10 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {techQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/60 dark:bg-[#16181e] p-4 sm:p-5 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        Question #{idx + 1}
                      </span>
                      {techQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setTechQuestions(techQuestions.filter((_, i) => i !== idx))
                          }
                          className="text-rose-500 hover:text-rose-700 p-1"
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
                      className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-[#111317] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden text-sm"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">Topic</label>
                        <select
                          value={q.topicId || ""}
                          onChange={(e) => {
                            const updated = [...techQuestions];
                            updated[idx].topicId = e.target.value;
                            setTechQuestions(updated);
                          }}
                          className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-[#111317] px-3 py-2 text-slate-800 dark:text-zinc-200"
                        >
                          {topics.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1">Difficulty</label>
                        <select
                          value={q.difficulty || "MEDIUM"}
                          onChange={(e) => {
                            const updated = [...techQuestions];
                            updated[idx].difficulty = e.target.value;
                            setTechQuestions(updated);
                          }}
                          className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-[#111317] px-3 py-2 text-slate-800 dark:text-zinc-200"
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
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
                      placeholder="Optional notes: How did you approach it? Follow-up questions asked?"
                      className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-[#111317] p-3 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HR INTERVIEW TAB */}
          {activeRoundTab === "HR" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  HR Questions Asked
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setHrQuestions([...hrQuestions, { text: "", notes: "" }])
                  }
                  className="rounded-xl bg-blue-600/10 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add HR Question</span>
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-semibold">Quick add:</span>
                {COMMON_HR_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      if (!hrQuestions.some((q) => q.text === prompt)) {
                        setHrQuestions([...hrQuestions, { text: prompt, notes: "" }]);
                      }
                    }}
                    className="rounded-full border border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#16181e] px-2.5 py-0.5 hover:border-blue-500/50 hover:text-blue-500 text-slate-700 dark:text-zinc-300 transition-colors"
                  >
                    + {prompt.slice(0, 28)}...
                  </button>
                ))}
              </div>

              <div className="space-y-3.5">
                {hrQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/60 dark:bg-[#16181e] p-4 sm:p-5 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        HR Question #{idx + 1}
                      </span>
                      {hrQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setHrQuestions(hrQuestions.filter((_, i) => i !== idx))
                          }
                          className="text-rose-500 hover:text-rose-700 p-1"
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
                      className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-[#111317] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden text-sm"
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
                      className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-[#111317] p-3 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GROUP DISCUSSION */}
          {activeRoundTab === "GROUP_DISCUSSION" && (
            <div className="text-xs sm:text-sm space-y-2">
              <label className="block font-semibold text-slate-700 dark:text-zinc-300">
                GD Topic & Evaluation Focus
              </label>
              <textarea
                rows={3}
                value={gdTopic}
                onChange={(e) => setGdTopic(e.target.value)}
                placeholder="What was the topic? How many candidates participated? What evaluation criteria were emphasized?"
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] p-3.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* MANAGERIAL / OTHER */}
          {(activeRoundTab === "MANAGERIAL" || activeRoundTab === "OTHER") && (
            <div className="text-xs sm:text-sm space-y-2">
              <label className="block font-semibold text-slate-700 dark:text-zinc-300">
                Round Notes & Topics Discussed
              </label>
              <textarea
                rows={3}
                value={managerialNotes}
                onChange={(e) => setManagerialNotes(e.target.value)}
                placeholder="Describe the nature of this round..."
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] p-3.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden"
              />
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
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-hidden max-w-sm text-sm"
              >
                <option value="SELECTED">Selected</option>
                <option value="REJECTED">Rejected</option>
                <option value="WAITLISTED">Waitlisted</option>
                <option value="PENDING">Result Pending</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
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
              onClick={() => setStep(step - 1)}
              className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-blue-500/50 hover:text-blue-500 inline-flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending}
            className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-[#16181e] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-blue-500/50 hover:text-blue-500 inline-flex items-center gap-1.5 transition-all shadow-xs"
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
              onClick={() => setStep(step + 1)}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 active:scale-95 inline-flex items-center gap-1.5 transition-all"
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitExperience}
              disabled={isPending}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 inline-flex items-center gap-2 transition-all"
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
