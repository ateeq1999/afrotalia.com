export type PaymentMethod = "mpesa" | "card" | "bank";

export interface ChargeResult {
  status: "succeeded";
  reference: string;
}

/**
 * Provider-agnostic charge: the client names a method, a server adapter
 * charges it. This is the only adapter wired up — it always succeeds, so
 * the registration-fee and (later) Shop checkout flows are fully walkable
 * without real payment credentials. Swap in a real provider per method
 * later without touching call sites (they only see `ChargeResult`).
 */
export async function mockCharge(params: {
  method: PaymentMethod;
  amountMinor: number;
}): Promise<ChargeResult> {
  return {
    status: "succeeded",
    reference: `mock_${params.method}_${crypto.randomUUID()}`,
  };
}
