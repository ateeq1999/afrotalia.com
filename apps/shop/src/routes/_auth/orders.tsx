import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";

import { cn } from "@afrotalia/ui/lib/utils";

import OrderStatusTracker from "@/components/shop/OrderStatusTracker";
import { confirmDelivery, listMyOrders, type ShopOrder } from "@/functions/orders";
import { formatTZS } from "@/lib/shop";

export const Route = createFileRoute("/_auth/orders")({
  component: OrdersPage,
  loader: () => listMyOrders(),
});

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}

function OrdersPage() {
  const orders = Route.useLoaderData();
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const confirm = async (order: ShopOrder) => {
    setConfirmingId(order.id);
    setErrors((prev) => ({ ...prev, [order.id]: "" }));
    try {
      const result = await confirmDelivery({ data: { orderId: order.id } });
      if (!result.ok) {
        setErrors((prev) => ({ ...prev, [order.id]: result.message }));
        return;
      }
      router.invalidate();
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <main className="bg-white font-sans text-[#18181B] antialiased">
      <div className="mx-auto w-full max-w-[800px] px-4 pb-16 pt-8 sm:px-5">
        <h1 className="text-[28px] font-bold tracking-tight">Your orders</h1>

        {orders.length === 0 ? (
          <div className="mt-6 rounded-xl border border-[#E4E4E7] bg-[#FAFAFA] px-4 py-16 text-center">
            <p className="text-[15px] font-semibold">You haven&apos;t placed any orders yet.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-[#E4E4E7] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-[#52525B]">{formatDate(order.createdAt)}</p>
                    <p className="mt-1 text-[15px] font-bold tabular-nums">{formatTZS(order.totalAmount)}</p>
                  </div>
                  <div className="w-full sm:w-auto">
                    <OrderStatusTracker status={order.status} />
                  </div>
                </div>

                <ul className="mt-4 space-y-1 border-t border-[#E4E4E7] pt-3 text-[13px] text-[#52525B]">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        {item.quantity}× {item.productName}
                      </span>
                      <span className="tabular-nums">{formatTZS(item.unitPrice * item.quantity)}</span>
                    </li>
                  ))}
                </ul>

                {order.status === "PROCESSING" || order.status === "SHIPPED" ? (
                  <div className="mt-4 border-t border-[#E4E4E7] pt-4">
                    <button
                      type="button"
                      disabled={confirmingId === order.id}
                      onClick={() => void confirm(order)}
                      className={cn(
                        "h-10 rounded-lg px-5 text-[13px] font-bold text-white transition-colors",
                        confirmingId === order.id ? "cursor-not-allowed bg-[#F4F4F5] text-[#8F8F98]" : "bg-brand-green-700 hover:bg-brand-green-700/90",
                      )}
                    >
                      {confirmingId === order.id ? "Confirming…" : "Confirm delivery"}
                    </button>
                    {errors[order.id] ? (
                      <p className="mt-2 text-[13px] font-medium text-[#DC2626]">{errors[order.id]}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
