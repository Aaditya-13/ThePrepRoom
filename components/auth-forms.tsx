"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Lock, ArrowRight, Sparkles } from "lucide-react";
import { loginAction, registerAction, demoLoginAction } from "@/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push(next);
        router.refresh();
      }
    });
  };

  const handleDemo = (role: "student" | "admin") => {
    setError(null);
    startTransition(async () => {
      const res = await demoLoginAction(role);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push(role === "admin" ? "/admin" : next);
        router.refresh();
      }
    });
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-8 sm:p-10 shadow-xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

      <div className="space-y-1.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 text-[11px] font-semibold text-blue-500 dark:text-blue-400">
          <Sparkles className="h-3 w-3" />
          <span>ThePrepRoom Account</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Sign In
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Access your contributed placement experiences, saved drafts, and personal bookmarks.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs relative z-10">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
            College / Registered Email
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="student@college.edu"
            className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-3 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-3 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 mt-2"
        >
          {isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Development quick testing accounts */}
      {process.env.NODE_ENV !== "production" && (
        <div className="rounded-2xl border border-dashed border-stone-300 dark:border-zinc-800 bg-stone-50/70 dark:bg-[#16181e] p-4 space-y-2.5 text-xs relative z-10">
          <p className="font-bold text-slate-800 dark:text-zinc-200 text-[11px] uppercase tracking-wider">
            Quick Evaluation Sign-in:
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            For local review and grading. Pre-loaded with seed credentials.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemo("student")}
              disabled={isPending}
              className="flex-1 rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-[#111317] py-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:border-blue-500/50 hover:text-blue-500 transition-colors shadow-xs"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleDemo("admin")}
              disabled={isPending}
              className="flex-1 rounded-xl bg-blue-600/10 border border-blue-500/30 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-slate-500 dark:text-zinc-400 border-t border-stone-100 dark:border-zinc-800 pt-4 relative z-10">
        Don't have an account?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await registerAction(null, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push(next);
        router.refresh();
      }
    });
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-8 sm:p-10 shadow-xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

      <div className="space-y-1.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 text-[11px] font-semibold text-blue-500 dark:text-blue-400">
          <Sparkles className="h-3 w-3" />
          <span>New Contributor</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
          Create Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Join your college placement repository to share and explore interview experiences.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs relative z-10">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Ved K."
            className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Email Address *</label>
          <input
            type="email"
            name="email"
            required
            placeholder="student@college.edu"
            className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Department</label>
            <input
              type="text"
              name="department"
              placeholder="e.g. IT, CS, Mech"
              className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Graduation Year</label>
            <input
              type="number"
              name="graduationYear"
              placeholder="e.g. 2027"
              className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Password *</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="Minimum 6 characters"
            className="w-full rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-[#0c0d10] px-4 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 mt-3"
        >
          {isPending ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-zinc-400 border-t border-stone-100 dark:border-zinc-800 pt-4 relative z-10">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
