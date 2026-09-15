import { depositFunds as depositFundsTx } from "@afrotalia/core/mnada/deposit-funds";
import { wallet, walletTransaction } from "@afrotalia/db/schema/mnada";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getDb } from "@/services";

export interface WalletLedgerEntry {
  id: string;
  kind: string;
  amount: number;
  balanceAfter: number;
  reference: string | null;
  createdAt: number;
}

export interface WalletOverview {
  balance: number;
  transactions: WalletLedgerEntry[];
}

export const getWalletOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<WalletOverview> => {
    if (!context.session) return { balance: 0, transactions: [] };
    const db = getDb();
    const [w] = await db.select().from(wallet).where(eq(wallet.userId, context.session.user.id)).limit(1);
    if (!w) return { balance: 0, transactions: [] };

    const rows = await db
      .select()
      .from(walletTransaction)
      .where(eq(walletTransaction.walletId, w.id))
      .orderBy(desc(walletTransaction.createdAt))
      .limit(50);

    return {
      balance: w.balance,
      transactions: rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        amount: row.amount,
        balanceAfter: row.balanceAfter,
        reference: row.reference,
        createdAt: row.createdAt.getTime(),
      })),
    };
  });

const depositFundsSchema = z.object({
  amount: z.number().int().positive().max(100_000_000),
  method: z.enum(["mpesa", "card", "bank"]),
});

export type DepositFundsResult = { ok: true; balance: number } | { ok: false; message: string };

export const depositFunds = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(depositFundsSchema)
  .handler(async ({ data, context }): Promise<DepositFundsResult> => {
    if (!context.session) return { ok: false, message: "Sign in to add funds." };
    const result = await depositFundsTx(getDb(), {
      userId: context.session.user.id,
      amount: data.amount,
      method: data.method,
    });
    return { ok: true, balance: result.balance };
  });
