"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  PlusCircle,
  Bookmark,
  Shield,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

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

  // Optimistic path highlight so navbar tab responds with 0ms delay on click
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const currentPath = optimisticPath || pathname;

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#090a0d]/90 backdrop-blur-md transition-colors select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group outline-none focus:outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-transform duration-300 ease-out group-hover:scale-105">
              <span className="tracking-tighter">PR</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold tracking-tight text-white text-lg">
                the<span className="text-blue-500">PrepRoom</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? currentPath === "/" : currentPath.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOptimisticPath(link.href)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-150 rounded-lg outline-none focus:outline-none focus-visible:outline-none border-0 ${
                    isActive
                      ? "text-blue-400 bg-blue-500/15 font-semibold"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 font-medium"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Share Experience Button */}
          <Link
            href="/share"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ease-out hover:shadow-lg hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-600/20 outline-none focus:outline-none"
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
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-[#14161f] px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors outline-none focus:outline-none cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-900">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{currentUser.name}</span>
                {currentUser.role === "ADMIN" && (
                  <span className="hidden md:inline rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] font-semibold text-zinc-200 uppercase">
                    Admin
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-[#111317] py-1 shadow-xl z-50 animate-in fade-in-50"
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                >
                  <div className="px-4 py-2 border-b border-zinc-800">
                    <p className="text-xs font-medium text-zinc-100 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                    {currentUser.department && (
                      <p className="text-[10px] text-zinc-500 mt-0.5">{currentUser.department}</p>
                    )}
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800/80 outline-none"
                  >
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                    <span>My Profile & Drafts</span>
                  </Link>

                  <Link
                    href="/bookmarks"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800/80 outline-none"
                  >
                    <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Saved Bookmarks</span>
                  </Link>

                  {currentUser.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-400 bg-blue-950/40 hover:bg-blue-950/60 outline-none"
                    >
                      <Shield className="h-3.5 w-3.5 text-blue-400" />
                      <span>Admin Moderation</span>
                    </Link>
                  )}

                  <div className="border-t border-zinc-800 my-1" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 text-left outline-none cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-xs sm:text-sm font-medium text-white px-3.5 py-1.5 transition-colors outline-none"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-zinc-800 bg-[#090a0d] px-4 pt-3 pb-6 md:hidden">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? currentPath === "/" : currentPath.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setOptimisticPath(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium border-0 outline-none ${
                    isActive
                      ? "bg-blue-500/15 font-semibold text-blue-400"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/share"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 outline-none"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Share Experience</span>
            </Link>

            {!currentUser && (
              <div className="pt-3 border-t border-zinc-800 mt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full rounded-lg bg-zinc-800 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
