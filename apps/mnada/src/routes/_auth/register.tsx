import { useState } from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

import { getMnadaAccountStatus } from "@/functions/registration";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/register")({
  component: RegisterPage,
  loader: async () => {
    const status = await getMnadaAccountStatus();
    if (status.phoneVerified) throw redirect({ to: "/activate" });
    return status;
  },
});

const inputClass = cn(
  "h-[50px] w-full rounded-lg border border-white/[0.08] bg-[#19191C] px-4",
  "text-[15px] font-semibold tabular-nums text-[#F5F5F5]",
  "placeholder:font-normal placeholder:text-[#5C5C60]",
  "outline-none transition-colors focus:border-[#FFBF19]/60 hover:border-white/[0.16]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const buttonClass = (disabled: boolean) =>
  cn(
    "h-[50px] w-full rounded-lg text-[15px] font-bold transition-all",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]",
    disabled
      ? "cursor-not-allowed bg-[#2A2A2E] text-[#6E6E73]"
      : "bg-[#FFBF19] text-black hover:bg-[#FFC93A] active:translate-y-px active:bg-[#F0AD00]",
  );

function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneValid = /^\+[1-9]\d{7,14}$/.test(phone);

  const sendOtp = async () => {
    if (!phoneValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: sendError } = await authClient.phoneNumber.sendOtp({ phoneNumber: phone });
      if (sendError) {
        setError(sendError.message ?? "Couldn't send the code. Try again.");
        return;
      }
      setOtpSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (code.length < 4 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: verifyError } = await authClient.phoneNumber.verify({
        phoneNumber: phone,
        code,
        updatePhoneNumber: true,
      });
      if (verifyError) {
        setError(verifyError.message ?? "That code didn't work. Try again.");
        return;
      }
      await router.navigate({ to: "/activate" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[440px] px-4 pb-14 pt-9">
        <h1 className="text-[26px] font-bold tracking-tight">Register for Mnada</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#8F9095]">
          Verify your phone number to continue. We&apos;ll text you a one-time code.
        </p>

        <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6">
          {!otpSent ? (
            <div className="space-y-3">
              <label htmlFor="phone" className="block text-[13px] font-medium text-[#8F9095]">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+255700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value.trim())}
                disabled={submitting}
                className={inputClass}
              />
              <p className="text-[12px] text-[#8F9095]">Include the country code, e.g. +255 for Tanzania.</p>
              <button
                type="button"
                disabled={!phoneValid || submitting}
                onClick={() => void sendOtp()}
                className={buttonClass(!phoneValid || submitting)}
              >
                {submitting ? "Sending…" : "Send code"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-[#8F9095]">
                Code sent to <span className="font-semibold text-[#F5F5F5]">{phone}</span>.
              </p>
              <label htmlFor="code" className="block text-[13px] font-medium text-[#8F9095]">
                Verification code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                disabled={submitting}
                className={cn(inputClass, "text-center tracking-[6px]")}
              />
              <button
                type="button"
                disabled={code.length < 4 || submitting}
                onClick={() => void verifyOtp()}
                className={buttonClass(code.length < 4 || submitting)}
              >
                {submitting ? "Verifying…" : "Verify"}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setOtpSent(false);
                  setCode("");
                  setError(null);
                }}
                className="w-full text-center text-[13px] font-medium text-[#8F9095] transition-colors hover:text-[#F5F5F5]"
              >
                Use a different number
              </button>
            </div>
          )}

          <div aria-live="polite" role="status" className="mt-3 min-h-[20px]">
            {error ? <p className="text-[13px] font-medium leading-snug text-[#FF5C5C]">{error}</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
