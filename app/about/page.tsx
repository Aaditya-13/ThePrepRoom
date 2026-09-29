import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Target,
  Code2,
  Users2,
  HeartHandshake,
  ArrowRight,
  BookOpen,
  Briefcase,
  Layers,
  MessageSquare,
  Cpu,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AboutFounderCard } from "@/components/about-founder-card";

export const metadata = {
  title: "About the Founder | ThePrepRoom",
  description:
    "Meet Ved Kalantri, the student behind ThePrepRoom — built to eliminate placement information asymmetry with verified interview experiences and peer insights.",
};

export default async function AboutPage() {
  // Fetch real-time platform statistics
  const [experiencesCount, questionsCount, companiesCount] = await Promise.all([
    prisma.experience.count({ where: { status: { in: ["APPROVED", "PENDING"] } } }),
    prisma.question.count(),
    prisma.company.count(),
  ]);

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100 pb-20 selection:bg-blue-600 selection:text-white">
      <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8 space-y-14">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-zinc-200 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium">About</span>
        </nav>

        {/* Hero Header */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-heading leading-tight">
            Built by a Student, for Every Student Preparing for Placements.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            ThePrepRoom was created to dismantle gatekept interview patterns, eliminate hearsay from
            WhatsApp groups, and give engineering students direct access to verified campus and
            off-campus interview insights.
          </p>
        </div>

        {/* Founder Spotlight & Authentic Personal Note */}
        <section className="rounded-3xl border border-zinc-800/90 bg-[#101217] p-6 sm:p-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Founder Profile Card */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <AboutFounderCard
                name="Ved Kalantri"
                department="Information Technology"
                graduationYear="Class of 2027"
                linkedinUrl="https://www.linkedin.com/in/ved-kalantri-b75915296/"
                githubUrl="https://github.com/VedKalantri"
                email="vedkalantri7@gmail.com"
                imageUrl="/images/ved-kalantri.jpg"
              />
            </div>

            {/* Right: Personal Authentic Narrative */}
            <div className="lg:col-span-8 space-y-5 text-zinc-300 leading-relaxed text-sm sm:text-base">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                  Founder&apos;s Note
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight font-heading">
                  Why I Built ThePrepRoom
                </h2>
              </div>

              <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
                <p>
                  During campus placement preparation, I observed a challenge that every engineering
                  student encounters. The hardest part of placement season is rarely the sheer complexity
                  of Data Structures or System Design — it is the{" "}
                  <strong className="text-white font-semibold">
                    frustrating asymmetry of information
                  </strong>
                  .
                </p>

                <p>
                  Whenever a dream company schedules a recruitment drive on campus, students end up
                  scrambling through fragmented WhatsApp chats, forgotten Google Drive links, and
                  hearsay from friends of friends. You find yourself asking:{" "}
                  <em className="text-zinc-200">
                    &ldquo;What was the exact structure of Round 1? Was there aptitude or negative
                    marking? What DSA topics did the interviewer emphasize? What kind of situational
                    questions were asked in the managerial round?&rdquo;
                  </em>
                </p>

                <p>
                  More often than not, this crucial knowledge remains trapped within small circles or is
                  lost the moment a batch graduates.
                </p>

                <p>
                  As an Information Technology undergraduate (<strong className="text-white">Class of 2027</strong>),
                  I built <span className="text-white font-bold">ThePrepRoom</span> to solve this
                  problem permanently. I wanted an open, fast, and structured platform where students
                  can document their genuine placement journeys — the exact online assessment patterns,
                  coding questions, interview mistakes, and preparation strategies — so juniors never
                  have to prepare in the dark.
                </p>

                <p className="pt-2 border-t border-zinc-800/80 text-zinc-400 italic text-xs sm:text-sm">
                  &ldquo;Knowledge shouldn&apos;t be gatekept. When one student succeeds and shares their
                  experience, they elevate the entire batch.&rdquo;
                </p>

                <div className="pt-2">
                  <p className="font-semibold text-white text-sm">Ved Kalantri</p>
                  <p className="text-xs text-zinc-400">
                    Department of Information Technology &bull; Founder, ThePrepRoom
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Platform Metrics */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Community Growth & Impact
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">Live Data</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-[#111317] p-4 sm:p-5 space-y-1">
              <div className="flex items-center justify-between text-zinc-500">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span className="text-[10px] uppercase font-bold text-blue-400">Verified</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                {experiencesCount}
              </p>
              <p className="text-xs text-zinc-400">Interview Experiences</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#111317] p-4 sm:p-5 space-y-1">
              <div className="flex items-center justify-between text-zinc-500">
                <MessageSquare className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] uppercase font-bold text-emerald-400">Cataloged</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                {questionsCount}
              </p>
              <p className="text-xs text-zinc-400">Interview Questions</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#111317] p-4 sm:p-5 space-y-1">
              <div className="flex items-center justify-between text-zinc-500">
                <Briefcase className="h-4 w-4 text-purple-400" />
                <span className="text-[10px] uppercase font-bold text-purple-400">Targeted</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                {companiesCount}
              </p>
              <p className="text-xs text-zinc-400">Companies Covered</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#111317] p-4 sm:p-5 space-y-1">
              <div className="flex items-center justify-between text-zinc-500">
                <HeartHandshake className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] uppercase font-bold text-amber-400">100% Free</span>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                Open
              </p>
              <p className="text-xs text-zinc-400">Student-Led Platform</p>
            </div>
          </div>
        </section>

        {/* The 3 Core Pillars */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
              Our Core Principles
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              How ThePrepRoom approaches interview preparation and peer sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-zinc-800/80 bg-[#101217] p-6 space-y-3 hover:border-zinc-700 transition-all">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Zero Gatekeeping</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Placement preparation should not depend on exclusive insider circles. Every interview
                round, assessment question, and hiring criteria is open for everyone to learn from.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-[#101217] p-6 space-y-3 hover:border-zinc-700 transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">High-Yield Accuracy</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Experiences are organized into structured rounds: Online Assessment, Technical
                Interview, and HR Discussion. Tagged with difficulty, time limits, and company-specific
                guidelines.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-[#101217] p-6 space-y-3 hover:border-zinc-700 transition-all">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white font-heading">Engineered for Students</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Engineered with modern web standards — instant search, mobile-responsive layout,
                keyboard ergonomics, and a dark theme built for late-night coding sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Modern Engineering Stack */}
        <section className="rounded-2xl border border-zinc-800 bg-[#111317] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Cpu className="h-4 w-4 text-blue-400" />
            <span>Architecture & Technology Stack</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-[#0c0d10] border border-zinc-800/80 text-center">
              <p className="font-bold text-white">Next.js 16</p>
              <p className="text-[10px] text-zinc-400">App Router & RSC</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0d10] border border-zinc-800/80 text-center">
              <p className="font-bold text-white">React 19</p>
              <p className="text-[10px] text-zinc-400">Server Actions</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0d10] border border-zinc-800/80 text-center">
              <p className="font-bold text-white">TypeScript</p>
              <p className="text-[10px] text-zinc-400">Strict Type Safety</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0d10] border border-zinc-800/80 text-center">
              <p className="font-bold text-white">Tailwind CSS</p>
              <p className="text-[10px] text-zinc-400">Dark Ergonomics</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0d10] border border-zinc-800/80 text-center">
              <p className="font-bold text-white">Prisma & SQLite</p>
              <p className="text-[10px] text-zinc-400">Relational Modeling</p>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0d10] border border-zinc-800/80 text-center">
              <p className="font-bold text-white">OAuth 2.0</p>
              <p className="text-[10px] text-zinc-400">Google & LinkedIn</p>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="rounded-3xl border border-zinc-800 bg-[#111317] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Have an Interview Story to Share?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300">
              Your experience could be the exact roadmap that helps a junior or classmate crack their
              first technical round. Contribute your experience anonymously or with your verified student
              profile.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/share"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5"
            >
              <span>Share Experience</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/experiences"
              className="rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <span>Explore Interviews</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
