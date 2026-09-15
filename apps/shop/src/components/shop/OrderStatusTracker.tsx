import { Check } from "lucide-react";

import { Badge } from "@afrotalia/ui/components/badge";
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
      <Badge tone="danger" surface="light">
        Cancelled
      </Badge>
    );
  }
  if (status === "PENDING_PAYMENT") {
    return (
      <Badge tone="warning" surface="light">
        Payment due
      </Badge>
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
                    : "border-hairline bg-white text-muted-ink",
                )}
                aria-current={index === currentIndex ? "step" : undefined}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span className={cn("text-[11px] font-medium", done ? "text-ink" : "text-muted-ink")}>
                {stage.label}
              </span>
            </div>
            {!isLast ? (
              <span
                aria-hidden
                className={cn("mx-2 h-[2px] flex-1", index < currentIndex ? "bg-brand-green-700" : "bg-hairline")}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
