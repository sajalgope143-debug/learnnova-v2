"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { otpRequestSchema, otpVerifySchema } from "@/lib/validators/auth";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

type Step = "phone" | "otp";

export default function OtpLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = otpRequestSchema.safeParse({ phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid phone number");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      toast.error(json.error ?? "Failed to send OTP");
      return;
    }

    toast.success("OTP sent to your phone");
    setStep("otp");
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = otpVerifySchema.safeParse({ phone, otp });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid code");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      toast.error(json.error ?? "Invalid or expired code");
      return;
    }

    toast.success("Logged in successfully!");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      {step === "otp" && (
        <button
          onClick={() => setStep("phone")}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={14} /> Change number
        </button>
      )}

      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
        {step === "phone" ? "Log in with OTP" : "Enter verification code"}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {step === "phone"
          ? "We'll text you a one-time code to log in."
          : `We sent a 6-digit code to ${phone}.`}
      </p>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone number
            </label>
            <input
              type="tel"
              placeholder="+919876543210"
              className="input-field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="input-field text-center text-lg tracking-[0.5em]"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify & log in"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Prefer email?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
          Log in with password
        </Link>
      </p>
    </div>
  );
}
