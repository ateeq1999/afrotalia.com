import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

import { depositFunds, getWalletOverview } from "@/functions/wallet";
import { formatTZS } from "@/lib/mnada";

export const Route = createFileRoute("/_auth/wallet")({
  component: WalletPage,
  loader: () => getWalletOverview(),
});

const QUICK_AMOUNTS = [50_000, 200_000, 1_000_000];

const KIND_LABELS: Record<string, string> = {
  DEPOSIT: "Deposit",
  BID_RESERVATION: "Bid reserved",
  BID_RELEASE: "Reservation released",
  AUCTION_PAYMENT: "Auction payment",
  REFUND: "Refund",
  REGISTRATION_FEE: "Registration fee",
};

function formatWhen(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

function WalletPage() {
  const overview = Route.useLoaderData();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFunds = async (value: number) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await depositFunds({ data: { amount: value, method: "mpesa" } });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.invalidate();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[730px] px-4 pb-14 pt-9">
        <h1 className="text-[28px] font-bold tracking-tight">Wallet</h1>

        <div className="mt-5 rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#8F9095]">Balance</p>
          <p className="mt-2 text-[32px] font-bold tabular-nums leading-none text-[#F5F5F5]">
            {formatTZS(overview.balance)}
          </p>

          <hr className="my-5 border-white/[0.08]" />

          <p className="mb-2 text-[13px] font-medium text-[#8F9095]">Add funds</p>
          <div role="group" aria-label="Quick deposit amounts" className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                disabled={submitting}
                onClick={() => void addFunds(value)}
                className={cn(
                  "h-11 rounded-lg border border-white/[0.08] bg-[#19191C] px-2 text-[13px] font-semibold tabular-nums text-[#F5F5F5] transition-colors",
                  "hover:border-white/[0.2] disabled:cursor-not-allowed disabled:opacity-40",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]",
                )}
              >
                {formatTZS(value)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-[#8F9095]">
            This is a mock top-up for development — no real payment is taken.
          </p>

          <div aria-live="polite" role="status" className="mt-2 min-h-[20px]">
            {error ? <p className="text-[13px] font-medium leading-snug text-[#FF5C5C]">{error}</p> : null}
          </div>
        </div>

        <section aria-label="Wallet history" className="mt-6 rounded-xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6">
          <h2 className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#8F9095]">History</h2>
          {overview.transactions.length === 0 ? (
            <p className="mt-3 text-[13px] text-[#8F9095]">No wallet activity yet.</p>
          ) : (
            <ol className="mt-1 divide-y divide-white/[0.06]">
              {overview.transactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 py-3 text-[13px]">
                  <span className="min-w-0 flex-1 truncate font-medium text-[#F5F5F5]">
                    {KIND_LABELS[tx.kind] ?? tx.kind}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-semibold tabular-nums",
                      tx.amount >= 0 ? "text-[#00D99A]" : "text-[#F5F5F5]",
                    )}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {formatTZS(tx.amount)}
                  </span>
                  <span className="w-[110px] shrink-0 text-right tabular-nums text-[#8F9095]">
                    {formatWhen(tx.createdAt)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
