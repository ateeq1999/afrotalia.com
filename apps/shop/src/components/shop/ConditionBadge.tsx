import { Badge, type BadgeProps } from "@afrotalia/ui/components/badge";

import { conditionLabel, type ProductCondition } from "@/lib/shop";

const TONE: Record<ProductCondition, BadgeProps["tone"]> = {
  NEW: "success",
  USED: "neutral",
  NOT_WORKING: "danger",
};

export default function ConditionBadge({
  condition,
  isWorking,
  className,
}: {
  condition: ProductCondition;
  isWorking: boolean;
  className?: string;
}) {
  return (
    <Badge tone={TONE[condition]} surface="light" className={className}>
      {conditionLabel(condition, isWorking)}
    </Badge>
  );
}
