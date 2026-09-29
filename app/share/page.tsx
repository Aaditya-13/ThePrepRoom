import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, FileText, Sparkles, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShareExperienceWizard } from "@/components/share-experience-wizard";

export const metadata = {
  title: "Share Interview Experience",
  description: "Contribute your placement experience, interview questions, and tips to help juniors prepare.",
};

interface PageProps {
  searchParams: Promise<{ draftId?: string; company?: string }>;
}

export default async function SharePage(props: PageProps) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:py-24 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-8 sm:p-10 shadow-xl space-y-5">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <Lock className="h-7 w-7" />
          </div>

          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Sign In to Share Your Experience
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
              To maintain authenticity and prevent spam, please sign in with your college account. You can freely choose to post anonymously.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-col gap-2.5">
            <Link
              href="/login?next=/share"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              Sign In to Continue
            </Link>
            <Link
              href="/register?next=/share"
              className="w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-[#16181e] py-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-200 hover:border-blue-500/50 hover:text-blue-500 transition-colors shadow-xs"
            >
              Create New Account
            </Link>
          </div>

          <div className="relative z-10 pt-2 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Option to remain 100% anonymous is always available</span>
          </div>
        </div>
      </div>
    );
  }

  // Fetch companies with roles
  const [companies, topics, draft] = await Promise.all([
    prisma.company.findMany({
      include: {
        roles: {
          select: { id: true, title: true, slug: true },
          orderBy: { title: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.topic.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    searchParams.draftId
      ? prisma.experience.findUnique({
          where: { id: searchParams.draftId },
          include: {
            rounds: {
              include: {
                questions: {
                  include: {
                    question: true,
                  },
                },
              },
            },
          },
        })
      : null,
  ]);

  // If draftId provided but does not belong to user, ignore draft
  const activeDraft = draft && draft.userId === user.id ? draft : null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* Top Banner Header */}
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-[-0.03em] text-white">
          {activeDraft ? "Continue Editing Draft" : "Share Placement Experience"}
        </h1>
      </div>

      <ShareExperienceWizard
        companies={companies}
        topics={topics}
        initialDraft={activeDraft}
        currentUserName={user.name}
      />
    </div>
  );
}
