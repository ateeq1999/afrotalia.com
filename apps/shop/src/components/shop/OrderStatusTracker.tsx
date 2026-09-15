import { Check } from "lucide-react";

import { cn } from "@afrotalia/ui/lib/utils";

export type OrderStatus = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STAGES = [
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
] as const;

export default function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center rounded-full border border-[#DC2626]/25 bg-[#DC2626]/10 px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.8px] text-[#DC2626]">
        Cancelled
      </span>
    );
  }
  if (status === "PENDING_PAYMENT") {
    return (
      <span className="inline-flex items-center rounded-full border border-brand-amber-600/25 bg-brand-amber-600/10 px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.8px] text-brand-amber-600">
        Payment due
      </span>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.status === status);

  return (
    <ol className="flex items-center" aria-label="Order progress">
      {STAGES.map((stage, index) => {
        const done = index <= currentIndex;
        const isLast = index === STAGES.length - 1;
        return (
          <li key={stage.status} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold",
                  done
                    ? "border-brand-green-700 bg-brand-green-700 text-white"
                    : "border-[#E4E4E7] bg-white text-[#52525B]",
                )}
                aria-current={index === currentIndex ? "step" : undefined}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className={cn("text-[11px] font-medium", done ? "text-[#18181B]" : "text-[#52525B]")}>
                {stage.label}
              </span>
            </div>
            {!isLast ? (
              <span
                aria-hidden
                className={cn("mx-2 h-[2px] flex-1", index < currentIndex ? "bg-brand-green-700" : "bg-[#E4E4E7]")}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
