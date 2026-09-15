import { DomainError, type DomainErrorCode } from "@afrotalia/core";
import { readSettingNumber } from "@afrotalia/core/mnada/db-helpers";
import { payRegistrationFee as payRegistrationFeeTx } from "@afrotalia/core/mnada/registration-payment";
import { mnadaProfile, wallet } from "@afrotalia/db/schema/mnada";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getDb } from "@/services";

export interface MnadaAccountStatus {
  signedIn: boolean;
  phoneVerified: boolean;
  /** Null when the user hasn't verified their phone yet — no profile exists. */
  profileStatus: "PENDING_PAYMENT" | "ACTIVE" | "BLOCKED" | null;
  registrationFeeMinor: number;
  walletBalance: number | null;
}

export const getMnadaAccountStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<MnadaAccountStatus> => {
    const db = getDb();
    const registrationFeeMinor = await readSettingNumber(db, "registrationFeeMinor", 50_000);

    if (!context.session) {
      return { signedIn: false, phoneVerified: false, profileStatus: null, registrationFeeMinor, walletBalance: null };
    }

    const [profile] = await db
      .select()
      .from(mnadaProfile)
      .where(eq(mnadaProfile.userId, context.session.user.id))
      .limit(1);
    const [w] = await db.select().from(wallet).where(eq(wallet.userId, context.session.user.id)).limit(1);

    return {
      signedIn: true,
      phoneVerified: Boolean(context.session.user.phoneNumberVerified),
      profileStatus: profile?.status ?? null,
      registrationFeeMinor,
      walletBalance: w?.balance ?? null,
    };
  });

const payRegistrationFeeSchema = z.object({
  method: z.enum(["mpesa", "card", "bank"]),
});

export type PayRegistrationFeeResult =
  | { ok: true; alreadyActive: boolean; feeMinor: number }
  | { ok: false; code: DomainErrorCode; message: string };

export const payRegistrationFee = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(payRegistrationFeeSchema)
  .handler(async ({ data, context }): Promise<PayRegistrationFeeResult> => {
    if (!context.session) {
      return { ok: false, code: "PROFILE_NOT_FOUND", message: "Sign in to register for Mnada." };
    }
    try {
      const result = await payRegistrationFeeTx(getDb(), {
        userId: context.session.user.id,
        method: data.method,
      });
      return { ok: true, ...result };
    } catch (err) {
      if (err instanceof DomainError) return { ok: false, code: err.code, message: err.message };
      throw err;
    }
  });
