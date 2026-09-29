"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Sparkles,
  Info,
} from "lucide-react";
import { loginAction, registerAction } from "@/actions/auth";

// SVG Logos for OAuth Providers
function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.26 21.3 7.36 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.27C.46 8.19 0 10.04 0 12s.46 3.81 1.27 5.43l4.01-3.14z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.7 1.27 6.57l4.01 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </svg>
  );
}

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function AuthSkeleton({ isRegister = false }: { isRegister?: boolean }) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111317] p-8 sm:p-10 shadow-2xl space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded-full bg-zinc-800" />
        <div className="h-8 w-40 rounded-lg bg-zinc-800" />
        <div className="h-3 w-64 rounded bg-zinc-800" />
      </div>
      <div className="space-y-2.5">
        <div className="h-10 w-full rounded-xl bg-zinc-800" />
        <div className="h-10 w-full rounded-xl bg-zinc-800" />
      </div>
      <div className="h-px w-full bg-zinc-800" />
      <div className="space-y-4">
        <div className="h-10 w-full rounded-xl bg-zinc-800" />
        <div className="h-10 w-full rounded-xl bg-zinc-800" />
        {isRegister && <div className="h-10 w-full rounded-xl bg-zinc-800" />}
        <div className="h-11 w-full rounded-xl bg-blue-600/30" />
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/experiences";
  const urlError = searchParams.get("error");
  const oauthNotice = searchParams.get("oauth_notice");

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(urlError || null);
  const [notice, setNotice] = useState<string | null>(oauthNotice || null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (urlError) setError(urlError);
    if (oauthNotice) setNotice(oauthNotice);
  }, [urlError, oauthNotice]);

  if (!mounted) {
    return <AuthSkeleton />;
  }

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

  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111317] p-8 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-[11px] font-semibold text-blue-400">
          <Sparkles className="h-3 w-3" />
          <span>Student Authentication</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Sign In
        </h1>
        <p className="text-xs text-zinc-400">
          Access placement interview experiences, questions bank, and bookmarks.
        </p>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 relative z-10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3.5 text-xs text-blue-300 flex items-start gap-2.5 relative z-10">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Social Single Sign-On (Google & LinkedIn) */}
      <div className="space-y-2.5 relative z-10">
        <a
          href={`/api/auth/google?next=${encodeURIComponent(next)}`}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-[#0c0d10] hover:bg-zinc-900/90 py-2.5 px-4 text-xs font-semibold text-zinc-100 transition-all hover:border-zinc-600 shadow-xs active:scale-[0.99]"
        >
          <GoogleIcon className="h-4 w-4" />
          <span>Continue with Google</span>
        </a>

        <a
          href={`/api/auth/linkedin?next=${encodeURIComponent(next)}`}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-[#0c0d10] hover:bg-zinc-900/90 py-2.5 px-4 text-xs font-semibold text-zinc-100 transition-all hover:border-zinc-600 shadow-xs active:scale-[0.99]"
        >
          <LinkedInIcon className="h-4 w-4" />
          <span>Continue with LinkedIn</span>
        </a>
      </div>

      {/* Divider */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
          or email
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Email / Password Form */}
      <form
        onSubmit={handleSubmit}
        suppressHydrationWarning={true}
        className="space-y-4 text-xs relative z-10"
      >
        <div>
          <label className="block font-semibold text-zinc-300 mb-1.5">
            College / Registered Email
          </label>
          <input
            type="email"
            name="email"
            required
            suppressHydrationWarning={true}
            placeholder="student@college.edu"
            className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-300 mb-1.5">
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            suppressHydrationWarning={true}
            placeholder="••••••••"
            className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 mt-2"
        >
          {isPending ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/80 relative z-10">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register?next=${encodeURIComponent(next)}`}
          className="font-bold text-blue-400 hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/experiences";

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <AuthSkeleton isRegister={true} />;
  }

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
    <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#111317] p-8 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute top-0 right-0 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-[11px] font-semibold text-blue-400">
          <Sparkles className="h-3 w-3" />
          <span>Student Registration</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Create Account
        </h1>
        <p className="text-xs text-zinc-400">
          Join your college placement repository to share and explore interview experiences.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 relative z-10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Social Single Sign-On (Google & LinkedIn) */}
      <div className="space-y-2.5 relative z-10">
        <a
          href={`/api/auth/google?next=${encodeURIComponent(next)}`}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-[#0c0d10] hover:bg-zinc-900/90 py-2.5 px-4 text-xs font-semibold text-zinc-100 transition-all hover:border-zinc-600 shadow-xs active:scale-[0.99]"
        >
          <GoogleIcon className="h-4 w-4" />
          <span>Sign up with Google</span>
        </a>

        <a
          href={`/api/auth/linkedin?next=${encodeURIComponent(next)}`}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-[#0c0d10] hover:bg-zinc-900/90 py-2.5 px-4 text-xs font-semibold text-zinc-100 transition-all hover:border-zinc-600 shadow-xs active:scale-[0.99]"
        >
          <LinkedInIcon className="h-4 w-4" />
          <span>Sign up with LinkedIn</span>
        </a>
      </div>

      {/* Divider */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
          or register with email
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        suppressHydrationWarning={true}
        className="space-y-3.5 text-xs relative z-10"
      >
        <div>
          <label className="block font-semibold text-zinc-300 mb-1">Full Name *</label>
          <input
            type="text"
            name="name"
            required
            suppressHydrationWarning={true}
            placeholder="Ved K."
            className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <div>
          <label className="block font-semibold text-zinc-300 mb-1">Email Address *</label>
          <input
            type="email"
            name="email"
            required
            suppressHydrationWarning={true}
            placeholder="student@college.edu"
            className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Department</label>
            <input
              type="text"
              name="department"
              suppressHydrationWarning={true}
              placeholder="e.g. IT, CS, Mech"
              className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">Graduation Year</label>
            <input
              type="number"
              name="graduationYear"
              suppressHydrationWarning={true}
              placeholder="e.g. 2027"
              className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-zinc-300 mb-1">Password *</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            suppressHydrationWarning={true}
            placeholder="Minimum 6 characters"
            className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden transition-all text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 mt-3"
        >
          {isPending ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800/80 relative z-10">
        Already have an account?{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="font-bold text-blue-400 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
