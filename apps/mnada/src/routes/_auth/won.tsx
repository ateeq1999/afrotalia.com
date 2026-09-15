import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

import { confirmWinPayment, listMyOrders, type MyOrder } from "@/functions/orders";
import { formatTZS } from "@/lib/mnada";

import OrderStatusBadge from "../../components/mnada/OrderStatusBadge";

export const Route = createFileRoute("/_auth/won")({
  component: WonPage,
  loader: () => listMyOrders(),
});

function formatDueDate(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

function WonPage() {
  const orders = Route.useLoaderData();
  const router = useRouter();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pay = async (order: MyOrder) => {
    setPayingId(order.id);
    setErrors((prev) => ({ ...prev, [order.id]: "" }));
    try {
      const result = await confirmWinPayment({ data: { orderId: order.id } });
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [order.id]: result.message }));
        return;
      }
      router.invalidate();
    } finally {
      setPayingId(null);
    }
  };

  return (
    <main className="bg-[#08090A] font-sans text-[#F5F5F5] antialiased">
      <div className="mx-auto w-full max-w-[730px] px-4 pb-14 pt-9">
        <h1 className="text-[28px] font-bold tracking-tight">Won auctions</h1>

        <div className="mt-5">
          {orders.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#121214] px-4 py-8 text-center">
              <p className="text-[14px] font-semibold">You haven&apos;t won any auctions yet.</p>
              <p className="mx-auto mt-2 max-w-[380px] text-[13px] leading-relaxed text-[#8F9095]">
                Winning bids show up here once a lot you led on closes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-white/[0.08] bg-[#121214] px-4 py-4 sm:px-5 sm:py-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold leading-snug text-[#F5F5F5] sm:text-[16px]">
                        {order.auctionTitle ?? "Auction lot"}
                      </p>
                      <p className="mt-1.5 text-[13px] tabular-nums text-[#8F9095]">
                        {formatTZS(order.totalAmount)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  {order.status === "PENDING_PAYMENT" ? (
                    <div className="mt-4 border-t border-white/[0.06] pt-4">
                      {order.paymentDueAt ? (
                        <p className="text-[12px] text-[#8F9095]">
                          Pay by <span className="tabular-nums text-[#F5F5F5]">{formatDueDate(order.paymentDueAt)}</span> or the
                          order is cancelled and a non-payment strike is recorded.
                        </p>
                      ) : null}
                      <button
                        type="button"
                        disabled={payingId === order.id}
                        onClick={() => void pay(order)}
                        className={cn(
                          "mt-3 h-11 w-full rounded-lg text-[14px] font-bold transition-colors sm:w-auto sm:px-6",
                          payingId === order.id
                            ? "cursor-not-allowed bg-[#2A2A2E] text-[#6E6E73]"
                            : "bg-[#FFBF19] text-black hover:bg-[#FFC93A] active:bg-[#F0AD00]",
                        )}
                      >
                        {payingId === order.id ? "Processing…" : "Pay now"}
                      </button>
                      {errors[order.id] ? (
                        <p className="mt-2 text-[13px] font-medium text-[#FF5C5C]">{errors[order.id]}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
