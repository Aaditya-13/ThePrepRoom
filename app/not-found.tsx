import Link from "next/link";
import { HelpCircle, ArrowLeft, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 dark:border-zinc-800/90 bg-white dark:bg-[#111317] p-8 sm:p-12 shadow-xl max-w-md w-full space-y-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
          <HelpCircle className="h-7 w-7" />
        </div>

        <div className="relative z-10 space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            The interview experience, question, company, or page you were looking for doesn't exist or has moved.
          </p>
        </div>

        <div className="relative z-10 pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/experiences"
            className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-[#16181e] px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-blue-500/50 hover:text-blue-500 inline-flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Experiences</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
