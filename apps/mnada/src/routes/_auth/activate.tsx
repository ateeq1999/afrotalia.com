import { useState } from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

import { getMnadaAccountStatus, payRegistrationFee } from "@/functions/registration";
import { formatTZS } from "@/lib/mnada";

export const Route = createFileRoute("/_auth/activate")({
  component: ActivatePage,
  loader: async () => {
    const status = await getMnadaAccountStatus();
    if (!status.phoneVerified) throw redirect({ to: "/register" });
    if (status.profileStatus === "ACTIVE") throw redirect({ to: "/" });
    return status;
  },
});

const METHODS = [
  { value: "mpesa", label: "Mobile money" },
  { value: "card", label: "Card" },
  { value: "bank", label: "Bank transfer" },
] as const;

function ActivatePage() {
  const status = Route.useLoaderData();
  const router = useRouter();
  const [method, setMethod] = useState<(typeof METHODS)[number]["value"]>("mpesa");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = status.profileStatus === "BLOCKED";

  const pay = async () => {
    if (submitting || blocked) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await payRegistrationFee({ data: { method } });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      await router.navigate({ to: "/" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[440px] px-4 pb-14 pt-9">
        <h1 className="text-[26px] font-bold tracking-tight">Activate your account</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#8F9095]">
          A one-time registration fee unlocks bidding on every live auction.
        </p>

        <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6">
          {blocked ? (
            <p className="text-[14px] leading-relaxed text-[#FF5C5C]">
              Your account has been blocked from bidding. Contact support if you think this is a mistake.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#8F9095]">Registration fee</span>
                <span className="text-[20px] font-bold tabular-nums text-[#FFBF19]">
                  {formatTZS(status.registrationFeeMinor)}
                </span>
              </div>

              <hr className="my-5 border-white/[0.08]" />

              <p className="mb-2 text-[13px] font-medium text-[#8F9095]">Pay with</p>
              <div role="group" aria-label="Payment method" className="grid grid-cols-3 gap-2">
                {METHODS.map((m) => {
                  const active = method === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setMethod(m.value)}
                      className={cn(
                        "h-11 rounded-lg border px-2 text-[13px] font-semibold transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]",
                        active
                          ? "border-[#FFBF19]/60 bg-[#FFBF19]/10 text-[#FFBF19]"
                          : "border-white/[0.08] bg-[#19191C] text-[#F5F5F5] hover:border-white/[0.2]",
                      )}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => void pay()}
                className={cn(
                  "mt-4 h-[50px] w-full rounded-lg text-[15px] font-bold transition-all",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]",
                  submitting
                    ? "cursor-not-allowed bg-[#2A2A2E] text-[#6E6E73]"
                    : "bg-[#FFBF19] text-black hover:bg-[#FFC93A] active:translate-y-px active:bg-[#F0AD00]",
                )}
              >
                {submitting ? "Processing…" : `Pay ${formatTZS(status.registrationFeeMinor)}`}
              </button>

              <p className="mt-3 text-[12px] leading-relaxed text-[#8F9095]">
                This is a mock charge for development — no real payment is taken.
              </p>
            </>
          )}

          <div aria-live="polite" role="status" className="mt-3 min-h-[20px]">
            {error ? <p className="text-[13px] font-medium leading-snug text-[#FF5C5C]">{error}</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
