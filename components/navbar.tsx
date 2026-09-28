"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Search,
  PlusCircle,
  Bookmark,
  Shield,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logoutAction, demoLoginAction } from "@/actions/auth";
import { ThemeToggle } from "./theme-toggle";

interface NavbarProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string | null;
  } | null;
}

export function Navbar({ currentUser }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Experiences", href: "/experiences" },
    { label: "Questions", href: "/questions" },
    { label: "Companies", href: "/companies" },
    { label: "Prepare", href: "/prepare" },
  ];

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      setUserMenuOpen(false);
      router.refresh();
    });
  };

  const handleDemoLogin = (role: "student" | "admin") => {
    startTransition(async () => {
      await demoLoginAction(role);
      setUserMenuOpen(false);
      router.refresh();
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 dark:border-zinc-800/80 dark:bg-[#090a0d]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-transform duration-300 ease-out group-hover:scale-105">
              <span className="tracking-tighter">PR</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-lg">
                the<span className="text-blue-500">PrepRoom</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 ease-out rounded-lg ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 font-semibold border border-blue-200/60 dark:border-blue-800/50 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/70"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Search Trigger */}
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50/70 dark:border-zinc-800 dark:bg-zinc-900/70 px-3 py-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:border-stone-300 dark:hover:border-zinc-700 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors duration-200"
            title="Search companies, questions, experiences..."
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden lg:inline-block rounded bg-stone-200/80 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-zinc-400">
              /
            </kbd>
          </Link>

          {/* Share Experience Button */}
          <Link
            href="/share"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ease-out hover:shadow-lg hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Share Experience</span>
          </Link>

          {/* User Account / Login */}
          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors focus:outline-hidden"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 dark:bg-stone-100 text-[11px] font-semibold text-white dark:text-stone-900">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{currentUser.name}</span>
                {currentUser.role === "ADMIN" && (
                  <span className="hidden md:inline rounded bg-slate-200 dark:bg-stone-800 px-1.5 py-0.2 text-[10px] font-semibold text-slate-800 dark:text-stone-200 uppercase">
                    Admin
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-1 shadow-lg z-50 animate-in fade-in-50"
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                >
                  <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-medium text-slate-900 dark:text-stone-100 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-stone-400 truncate">{currentUser.email}</p>
                    {currentUser.department && (
                      <p className="text-[10px] text-slate-400 dark:text-stone-500 mt-0.5">{currentUser.department}</p>
                    )}
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    <User className="h-3.5 w-3.5 text-slate-500 dark:text-stone-400" />
                    <span>My Profile & Drafts</span>
                  </Link>

                  <Link
                    href="/bookmarks"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-slate-500 dark:text-stone-400" />
                    <span>Saved Bookmarks</span>
                  </Link>

                  {currentUser.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                    >
                      <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Admin Moderation</span>
                    </Link>
                  )}

                  <div className="border-t border-stone-100 dark:border-stone-800 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-slate-700 dark:text-stone-300 hover:text-slate-900 dark:hover:text-stone-100 px-2 py-1"
              >
                Sign In
              </Link>
              {process.env.NODE_ENV !== "production" && (
                <div className="hidden lg:flex items-center gap-1 border-l border-stone-200 dark:border-stone-800 pl-2">
                  <button
                    onClick={() => handleDemoLogin("student")}
                    disabled={isPending}
                    className="rounded border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 px-2 py-0.5 text-[11px] text-slate-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                    title="Dev: Login as Student"
                  >
                    Demo Student
                  </button>
                  <button
                    onClick={() => handleDemoLogin("admin")}
                    disabled={isPending}
                    className="rounded border border-slate-300 dark:border-stone-700 bg-slate-100 dark:bg-stone-800 px-2 py-0.5 text-[11px] font-semibold text-slate-800 dark:text-stone-200 hover:bg-slate-200 dark:hover:bg-stone-700"
                    title="Dev: Login as Admin"
                  >
                    Demo Admin
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-1.5 text-slate-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-stone-200 dark:border-zinc-800 bg-white dark:bg-[#090a0d] px-4 pt-3 pb-6 md:hidden">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                    ? "bg-blue-50 dark:bg-blue-950/60 font-semibold text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-zinc-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/share"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Share Experience</span>
            </Link>

            {process.env.NODE_ENV !== "production" && !currentUser && (
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 mt-2 flex gap-2">
                <button
                  onClick={() => handleDemoLogin("student")}
                  className="flex-1 rounded border border-stone-200 dark:border-stone-800 py-1.5 text-xs text-slate-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-900"
                >
                  Demo Student
                </button>
                <button
                  onClick={() => handleDemoLogin("admin")}
                  className="flex-1 rounded border border-slate-300 dark:border-stone-700 py-1.5 text-xs font-semibold text-slate-800 dark:text-stone-200 bg-slate-100 dark:bg-stone-800"
                >
                  Demo Admin
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
