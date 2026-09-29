"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  QrCode,
  Copy,
  Check,
  Download,
  AlertCircle,
  ArrowLeft,
  Smartphone,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  adminVerifyCredentialsAction,
  adminConfirmTotpSetupAction,
  adminVerifyTotpAction,
  AdminAuthStep,
} from "@/actions/admin-auth";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const urlError = searchParams.get("error");

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<AdminAuthStep>("CREDENTIALS");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(urlError || null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // Setup state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Verification state
  const [totpToken, setTotpToken] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Step 1: Verify Credentials
  const handleCredentialsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const emailVal = (formData.get("email") as string) || "";
    setEmail(emailVal);

    startTransition(async () => {
      const res = await adminVerifyCredentialsAction(null, formData);
      if (res.error) {
        setError(res.error);
        if (typeof res.remainingAttempts === "number") {
          setRemainingAttempts(res.remainingAttempts);
        }
      } else if (res.step === "SETUP_TOTP") {
        setStep("SETUP_TOTP");
        setQrCodeDataUrl(res.qrCodeDataUrl || null);
        setSecretKey(res.secret || null);
        setRecoveryCodes(res.recoveryCodes || []);
      } else if (res.step === "VERIFY_TOTP") {
        setStep("VERIFY_TOTP");
      }
    });
  };

  // Handle Step 2A: Confirm initial setup
  const handleConfirmSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (totpToken.length !== 6) {
      setError("Please enter the complete 6-digit code from your authenticator app.");
      return;
    }

    startTransition(async () => {
      const res = await adminConfirmTotpSetupAction(email, totpToken);
      if (res.error) {
        setError(res.error);
        if (typeof res.remainingAttempts === "number") {
          setRemainingAttempts(res.remainingAttempts);
        }
      } else if (res.success) {
        router.push(next);
        router.refresh();
      }
    });
  };

  // Handle Step 2B: Verify TOTP or Recovery Code
  const handleVerifyTotp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const code = useRecoveryCode ? recoveryCodeInput.trim() : totpToken.trim();
    if (!code) {
      setError(
        useRecoveryCode
          ? "Please enter your backup recovery code."
          : "Please enter your 6-digit authenticator code."
      );
      return;
    }

    startTransition(async () => {
      const res = await adminVerifyTotpAction(email, code, useRecoveryCode);
      if (res.error) {
        setError(res.error);
        if (typeof res.remainingAttempts === "number") {
          setRemainingAttempts(res.remainingAttempts);
        }
      } else if (res.success) {
        router.push(next);
        router.refresh();
      }
    });
  };

  // Helpers for copy/download
  const handleCopySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleCopyCodes = () => {
    if (recoveryCodes.length > 0) {
      navigator.clipboard.writeText(recoveryCodes.join("\n"));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const handleDownloadCodes = () => {
    const text = [
      "THEPREPROOM - ADMIN BACKUP RECOVERY CODES",
      `Generated for: ${email}`,
      `Date: ${new Date().toISOString()}`,
      "------------------------------------------",
      "Keep these single-use recovery codes in a secure place.",
      "Each code can only be used once if you lose access to your TOTP authenticator.",
      "------------------------------------------",
      "",
      ...recoveryCodes,
      "",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thepreproom-admin-recovery-codes-${email.split("@")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#111317] p-8 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background glow */}
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Header Badge & Title */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Administrator Access</span>
          </div>
          <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-500">
            2FA Enforced
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white">
          {step === "CREDENTIALS" && "Admin Sign In"}
          {step === "SETUP_TOTP" && "Configure 2FA Authenticator"}
          {step === "VERIFY_TOTP" && "Two-Factor Verification"}
        </h1>
        <p className="text-xs text-zinc-400">
          {step === "CREDENTIALS" &&
            "Authorized administration access. Single-session credentials with required two-factor authentication."}
          {step === "SETUP_TOTP" &&
            "Scan the QR code below using Google Authenticator, Authy, or 1Password to activate your admin account."}
          {step === "VERIFY_TOTP" &&
            `Enter the 6-digit TOTP security code generated by your authenticator app for ${email}.`}
        </p>
      </div>

      {/* Error / Rate Limit Banner */}
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5 relative z-10">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          <div className="space-y-1">
            <p className="font-medium">{error}</p>
            {typeof remainingAttempts === "number" && remainingAttempts > 0 && (
              <p className="text-[11px] text-rose-400/80">
                Security notice: {remainingAttempts} attempt{remainingAttempts === 1 ? "" : "s"} remaining before temporary lockout.
              </p>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: CREDENTIALS */}
      {step === "CREDENTIALS" && (
        <form
          onSubmit={handleCredentialsSubmit}
          suppressHydrationWarning={true}
          className="space-y-4 text-xs relative z-10"
        >
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              Administrator Email
            </label>
            <input
              type="email"
              name="email"
              required
              defaultValue={email}
              suppressHydrationWarning={true}
              placeholder="admin@thepreproom.internal"
              className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden transition-all text-sm font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-zinc-300">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 transition-colors"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="h-3 w-3" /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" /> Show
                  </>
                )}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              suppressHydrationWarning={true}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-zinc-700/80 bg-[#0c0d10] px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden transition-all text-sm font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Continue to 2FA Verification</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2A: SETUP TOTP (First-time Enrollment) */}
      {step === "SETUP_TOTP" && (
        <div className="space-y-5 text-xs relative z-10">
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0d10] p-4 flex flex-col sm:flex-row items-center gap-4">
            {qrCodeDataUrl ? (
              <div className="bg-white p-2 rounded-xl shrink-0 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeDataUrl}
                  alt="Admin 2FA QR Code"
                  width={140}
                  height={140}
                  className="rounded-lg"
                />
              </div>
            ) : (
              <div className="h-32 w-32 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                <QrCode className="h-10 w-10 animate-pulse" />
              </div>
            )}

            <div className="space-y-2 text-left w-full">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
                <Smartphone className="h-4 w-4" />
                <span>Scan with Authenticator App</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Open Google Authenticator, Authy, or 1Password and scan the QR code to register your admin profile.
              </p>
              {secretKey && (
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                    Manual Secret Key:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <code className="text-[11px] font-mono bg-zinc-900 text-zinc-200 px-2 py-1 rounded border border-zinc-800 select-all">
                      {secretKey}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      title="Copy Secret"
                    >
                      {copiedSecret ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Backup Recovery Codes Box */}
          {recoveryCodes.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Single-Use Backup Recovery Codes (8)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCodes}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
                  >
                    {copiedCodes ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCodes}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-800 transition-colors"
                  >
                    <Download className="h-3 w-3" /> Save .txt
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400">
                Save these emergency codes safely. If you lose your phone or authenticator app, these are the only way to recover access.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                {recoveryCodes.map((c, idx) => (
                  <div
                    key={idx}
                    className="font-mono text-[11px] text-center bg-[#0c0d10] text-zinc-200 py-1 px-1.5 rounded border border-zinc-800"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm TOTP Code Input */}
          <form onSubmit={handleConfirmSetup} suppressHydrationWarning={true} className="space-y-4">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Confirm 6-Digit Authenticator Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={totpToken}
                suppressHydrationWarning={true}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                autoFocus
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl border border-zinc-700 bg-[#0c0d10] text-emerald-400 placeholder:text-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || totpToken.length !== 6}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? "Activating 2FA..." : "Verify & Activate Admin Session"}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2B: VERIFY TOTP (Normal Login) */}
      {step === "VERIFY_TOTP" && (
        <form onSubmit={handleVerifyTotp} suppressHydrationWarning={true} className="space-y-5 text-xs relative z-10">
          {!useRecoveryCode ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-zinc-300">
                  6-Digit Authenticator Code
                </label>
                <span className="text-[11px] text-zinc-500">RFC 6238 TOTP</span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={totpToken}
                suppressHydrationWarning={true}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                className="w-full text-center tracking-[0.4em] font-mono text-2xl py-3.5 rounded-xl border border-zinc-700 bg-[#0c0d10] text-emerald-400 placeholder:text-zinc-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden transition-all"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-zinc-300">
                  Backup Recovery Code
                </label>
                <span className="text-[11px] text-amber-400">Single-use</span>
              </div>
              <input
                type="text"
                maxLength={9}
                value={recoveryCodeInput}
                suppressHydrationWarning={true}
                onChange={(e) => setRecoveryCodeInput(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                autoFocus
                className="w-full text-center tracking-widest font-mono text-xl py-3.5 rounded-xl border border-amber-500/40 bg-[#0c0d10] text-amber-300 placeholder:text-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-hidden transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Verify Admin Identity</span>
              </>
            )}
          </button>

          {/* Toggle between TOTP app and Recovery code */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setUseRecoveryCode(!useRecoveryCode);
                setError(null);
              }}
              className="text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              {useRecoveryCode
                ? "Use 6-digit authenticator code instead"
                : "Lost access? Use backup recovery code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("CREDENTIALS");
                setError(null);
                setTotpToken("");
                setRecoveryCodeInput("");
              }}
              className="text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
          </div>
        </form>
      )}

      {/* Standalone minimal footer */}
      <div className="text-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-4 relative z-10">
        <Link
          href="/"
          className="text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to ThePrepRoom
        </Link>
      </div>
    </div>
  );
}
