"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { adminLogoutAction } from "@/actions/admin-auth";

export function AdminLogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await adminLogoutAction();
      router.push("/admin/login");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{isPending ? "Logging out..." : "Sign Out"}</span>
    </button>
  );
}
