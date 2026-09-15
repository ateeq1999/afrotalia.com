import { Badge, type BadgeProps } from "@afrotalia/ui/components/badge";

export type OrderStatus = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_TONE: Record<OrderStatus, BadgeProps["tone"]> = {
  PENDING_PAYMENT: "warning",
  PROCESSING: "success",
  SHIPPED: "success",
  DELIVERED: "success",
  CANCELLED: "danger",
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
    <Badge tone={STATUS_TONE[status]} surface="dark">
      {STATUS_LABELS[status]}
    </Badge>
  );
}
