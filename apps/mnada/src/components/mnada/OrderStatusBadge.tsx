import { cn } from "@afrotalia/ui/lib/utils";

export type OrderStatus = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "border-[#FFBF19]/25 bg-[#FFBF19]/10 text-[#FFBF19]",
  PROCESSING: "border-[#00D99A]/25 bg-[#00D99A]/10 text-[#00D99A]",
  SHIPPED: "border-[#00D99A]/25 bg-[#00D99A]/10 text-[#00D99A]",
  DELIVERED: "border-[#00D99A]/25 bg-[#00D99A]/10 text-[#00D99A]",
  CANCELLED: "border-[#FF5C5C]/25 bg-[#FF5C5C]/10 text-[#FF5C5C]",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Payment due",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.8px]",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
