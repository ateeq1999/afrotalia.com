/** Money is always TZS with thousands separators and no decimals. */
export function formatTZS(amount: number): string {
  return `TZS ${amount.toLocaleString("en-US")}`;
}
