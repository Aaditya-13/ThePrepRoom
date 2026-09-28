import { Suspense } from "react";
import { RegisterForm } from "@/components/auth-forms";

export const metadata = {
  title: "Create Account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-slate-400">Loading register...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
