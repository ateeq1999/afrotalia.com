import { Badge, type BadgeProps } from "@afrotalia/ui/components/badge";

import type { AuctionStatus } from "@/lib/mnada";

// Amber is urgency only (spec): live and closing lean on warning/danger tones, never green.
const STATUS_TONE: Record<AuctionStatus, BadgeProps["tone"]> = {
  live: "warning",
  closing: "danger",
  scheduled: "neutral",
  ended: "neutral",
};

const STATUS_LABELS: Record<AuctionStatus, string> = {
  live: "Live",
  closing: "Closing",
  scheduled: "Scheduled",
  ended: "Ended",
};

export default function AuctionStatusBadge({ status }: { status: AuctionStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} surface="dark">
      {STATUS_LABELS[status]}
    </Badge>
  );
}
