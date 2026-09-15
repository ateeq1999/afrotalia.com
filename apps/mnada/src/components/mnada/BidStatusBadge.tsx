import { Badge, type BadgeProps } from "@afrotalia/ui/components/badge";

import type { BidStatus } from "@/lib/my-bids";

const STATUS_TONE: Record<BidStatus, BadgeProps["tone"]> = {
  leading: "success",
  outbid: "danger",
};

const STATUS_LABELS: Record<BidStatus, string> = {
  leading: "Leading",
  outbid: "Outbid",
};

export default function BidStatusBadge({ status }: { status: BidStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} surface="dark">
      {STATUS_LABELS[status]}
    </Badge>
  );
}
