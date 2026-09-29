import Link from "next/link";
import { BookOpen, Layers, Terminal, Users, ArrowRight, Sparkles, CheckCircle2, Bookmark } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Placement Preparation Hub",
  description: "Curated preparation roadmaps, high-yield topics, and questions for campus recruitment.",
};

const PREP_CATEGORIES = [
  {
    category: "Core Computer Science",
    tagline: "Essential Theory",
    description: "Fundamental computer science theory asked in almost every technical round across product and services companies.",
    icon: Layers,
    accent: "blue",
    badgeClass: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20",
    topics: [
      { name: "Computer Networks", slug: "computer-networks", focus: "OSI Model, TCP vs UDP, DNS, HTTP/HTTPS, Subnetting, Socket Programming" },
      { name: "Operating Systems", slug: "operating-systems", focus: "Processes vs Threads, Virtual Memory, Deadlocks, CPU Scheduling, Mutex" },
      { name: "Database Systems (DBMS)", slug: "dbms", focus: "ACID properties, SQL Indexing (B-Tree), Normalization 1NF-BCNF, Complex Joins" },
      { name: "Data Structures & Algorithms", slug: "dsa", focus: "Arrays, Two Pointers, Linked Lists, Trees, Graph traversals, Dynamic Programming" },
    ],
  },
  {
    category: "Cloud & Infrastructure",
    tagline: "Production Systems",
    description: "Crucial for Cloud Support, DevOps, Systems Engineering, and Enterprise Consulting roles.",
    icon: Terminal,
    accent: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    topics: [
      { name: "Linux Administration", slug: "linux-admin", focus: "File permissions, chmod/chown, grep, awk, systemd, SSH keys, Shell scripting" },
      { name: "Cloud Computing", slug: "cloud-computing", focus: "AWS/Azure fundamentals, EC2, S3, IAM, Active Directory, LDAP, VPC" },
    ],
  },
  {
    category: "Development & Engineering",
    tagline: "Practical Architectures",
    description: "Modern software engineering practicals, web architectures, and system design basics.",
    icon: BookOpen,
    accent: "purple",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    topics: [
      { name: "Web Development", slug: "web-dev", focus: "REST APIs, HTTP status codes, Authentication (JWT/Session), Client-Server model" },
    ],
  },
  {
    category: "Interview Essentials",
    tagline: "Behavioral & Culture",
    description: "Behavioral rounds, culture fit, situational judgment, and communication questions.",
    icon: Users,
    accent: "amber",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    topics: [
      { name: "HR & Behavioral Rounds", slug: "hr-behavioral", focus: "Elevator pitch, Handling team conflict, 24x7 rotation shifts, 5-year vision, Strengths & Weaknesses" },
    ],
  },
];

export default async function PreparePage() {
  // Fetch real counts of questions per topic to show true volume
  const topicsWithCounts = await prisma.topic.findMany({
    include: {
      _count: {
        select: {
          questions: {
            where: {
              experienceLinks: {
                some: { experience: { status: "APPROVED" } },
              },
            },
          },
        },
      },
    },
  });

  const countMap = new Map(topicsWithCounts.map((t) => [t.slug, t._count.questions]));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-12">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-[-0.03em] text-white">
          Placement Preparation Hub
        </h1>
      </div>

      {/* Categories Grid */}
      <div className="space-y-12">
        {PREP_CATEGORIES.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.category} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                        {section.category}
                      </h2>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${section.badgeClass}`}>
                        {section.tagline}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{section.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.topics.map((t) => {
                  const qCount = countMap.get(t.slug) || 0;
                  return (
                    <Link
                      key={t.slug}
                      href={`/questions?topic=${t.slug}`}
                      className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-[#111317] p-5 sm:p-6 shadow-xs hover:border-blue-500/40 hover:-translate-y-0.5 active:scale-[0.995] hover:shadow-xl hover:shadow-black/40 transition-[transform,border-color,background-color,box-shadow] duration-200 outline-none"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            {t.name}
                          </h3>
                          <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs font-mono font-medium text-zinc-300">
                            {qCount} {qCount === 1 ? "question" : "questions"}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                          <span className="font-semibold text-zinc-200">High-Yield Focus: </span>
                          {t.focus}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-medium text-blue-400">
                        <span>Explore topic questions</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Revision Strategy Card */}
      <div className="rounded-3xl border border-zinc-800/80 bg-[#111317] p-6 sm:p-8 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white">
          Pro-Tip: How to Prepare Using ThePrepRoom
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="rounded-xl border border-zinc-800 bg-[#16181e] p-4 space-y-2">
            <span className="font-bold text-blue-400">1. Start with Targeted Companies</span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Check the Companies section for the upcoming recruiters on your campus. Study their specific selection rounds and typical OA cutoff patterns.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#16181e] p-4 space-y-2">
            <span className="font-bold text-emerald-400">2. Master the Core Topics</span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Brush up on OS, Networks, and DBMS questions. Recruiters consistently test fundamental computer science understanding across all branches.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#16181e] p-4 space-y-2">
            <span className="font-bold text-purple-400">3. Rehearse Candidate Advice</span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Read through the "Advice for Juniors" on verified experiences. Seniors frequently share critical details about interviewer demeanor and common pitfalls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
