export type ProductCondition = "NEW" | "USED" | "NOT_WORKING";

export function formatTZS(amount: number): string {
  return `TZS ${amount.toLocaleString("en-US")}`;
}

export function conditionLabel(condition: ProductCondition, isWorking: boolean): string {
  if (condition === "NEW") return "New";
  if (condition === "NOT_WORKING") return "Not working";
  return isWorking ? "Used · Working" : "Used";
}
