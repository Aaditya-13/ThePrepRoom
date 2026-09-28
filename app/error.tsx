"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-8 sm:p-12 shadow-xl max-w-md w-full space-y-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>

        <div className="relative z-10 space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            An unexpected error occurred while loading this page. You can try refreshing or returning to the home page.
          </p>
        </div>

        <div className="relative z-10 pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-[#16181e] px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-blue-500/50 hover:text-blue-500 inline-flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
