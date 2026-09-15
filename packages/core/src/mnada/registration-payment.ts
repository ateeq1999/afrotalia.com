import type { Database } from "@afrotalia/db";
import { mnadaProfile, wallet } from "@afrotalia/db/schema/mnada";
import { eq } from "drizzle-orm";

import { DomainError } from "../errors";
import { mockCharge, type PaymentMethod } from "../payments/mock-provider";
import { logAudit, readSettingNumber } from "./db-helpers";

export interface PayRegistrationFeeResult {
  alreadyActive: boolean;
  feeMinor: number;
}

/**
 * Charges the one-time Mnada registration fee (amount from `mnada_setting`,
 * never hard-coded) and activates the account. The fee is paid through the
 * mock payment provider, not the auction wallet — this only ensures a
 * wallet row exists (balance 0) so the newly-active account can bid.
 */
export async function payRegistrationFee(
  db: Database,
  params: { userId: string; method: PaymentMethod },
): Promise<PayRegistrationFeeResult> {
  return db.transaction(async (tx) => {
    const [profile] = await tx
      .select()
      .from(mnadaProfile)
      .where(eq(mnadaProfile.userId, params.userId))
      .for("update");
    if (!profile) throw new DomainError("PROFILE_NOT_FOUND");
    if (profile.status === "BLOCKED") throw new DomainError("ACCOUNT_NOT_ACTIVE");

    const feeMinor = await readSettingNumber(tx, "registrationFeeMinor", 50_000);
    if (profile.status === "ACTIVE") return { alreadyActive: true, feeMinor };

    const charge = await mockCharge({ method: params.method, amountMinor: feeMinor });

    await tx.update(mnadaProfile).set({ status: "ACTIVE" }).where(eq(mnadaProfile.id, profile.id));
    await tx
      .insert(wallet)
      .values({ userId: params.userId, balance: 0 })
      .onConflictDoNothing({ target: wallet.userId });
    await logAudit(tx, {
      actorUserId: params.userId,
      entityType: "mnada_profile",
      entityId: params.userId,
      action: "REGISTRATION_FEE_PAID",
      metadata: { feeMinor, method: params.method, reference: charge.reference },
    });

    return { alreadyActive: false, feeMinor };
  });
}
