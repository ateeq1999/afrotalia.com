import type { Database } from "@afrotalia/db";
import { auditLog, mnadaSetting, wallet, walletTransaction } from "@afrotalia/db/schema/mnada";
import { eq } from "drizzle-orm";

type TransactionCallback = Parameters<Database["transaction"]>[0];
type Tx = TransactionCallback extends (tx: infer T, ...args: never[]) => unknown ? T : never;

/** Works with either a `Database` or a transaction handle — same query API. */
export type Db = Database | Tx;

export async function readSettingNumber(db: Db, key: string, fallback: number): Promise<number> {
  const [row] = await db.select().from(mnadaSetting).where(eq(mnadaSetting.key, key)).limit(1);
  if (!row) return fallback;
  const parsed = Number(row.value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function logAudit(
  db: Db,
  entry: {
    actorUserId?: string | null;
    entityType: string;
    entityId: string;
    action: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await db.insert(auditLog).values({
    actorUserId: entry.actorUserId ?? null,
    entityType: entry.entityType,
    entityId: entry.entityId,
    action: entry.action,
    metadata: entry.metadata ?? null,
  });
}

/** Credits `amount` back to `userId`'s wallet and logs a `BID_RELEASE` ledger row. No-ops if the wallet doesn't exist. */
export async function releaseReservation(
  db: Db,
  params: { userId: string; amount: number; reference: string },
): Promise<void> {
  const [w] = await db.select().from(wallet).where(eq(wallet.userId, params.userId)).for("update");
  if (!w) return;
  const balanceAfter = w.balance + params.amount;
  await db.update(wallet).set({ balance: balanceAfter }).where(eq(wallet.id, w.id));
  await db.insert(walletTransaction).values({
    walletId: w.id,
    kind: "BID_RELEASE",
    amount: params.amount,
    balanceAfter,
    reference: params.reference,
  });
}
