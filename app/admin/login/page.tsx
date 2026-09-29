import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata = {
  title: "Admin Portal Sign In | ThePrepRoom",
  description: "Secure administrator authentication with RFC 6238 TOTP two-factor verification.",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-zinc-400">Loading admin security portal...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
