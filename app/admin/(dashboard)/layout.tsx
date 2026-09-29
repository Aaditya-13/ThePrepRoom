import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getSessionPayload, getCurrentUser } from "@/lib/auth";
import { AdminLogoutButton } from "@/components/admin-logout-button";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionPayload();

  // Strictly enforce ADMIN role AND adminVerified (2FA passed)
  if (!session || session.role !== "ADMIN" || !session.adminVerified) {
    redirect("/admin/login?next=/admin");
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login?next=/admin");
  }

  return (
    <div className="min-h-screen bg-[#090a0d]">
      {/* Top Admin Security Status Bar */}
      <div className="border-b border-zinc-800 bg-[#111317]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>TOTP Verified Admin Session</span>
            </div>
            <span className="hidden sm:inline text-zinc-400">
              Logged in as <strong className="text-zinc-200">{user.email}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-zinc-400 hover:text-zinc-200 transition-colors text-xs"
            >
              Public Site
            </Link>
            <span className="text-zinc-700">|</span>
            <AdminLogoutButton />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
