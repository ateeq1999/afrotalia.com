import { confirmWinPayment as confirmWinPaymentTx } from "@afrotalia/core/mnada/confirm-win-payment";
import { DomainError, type DomainErrorCode } from "@afrotalia/core/errors";
import { auction, order } from "@afrotalia/db/schema/mnada";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getDb } from "@/services";

export interface MyOrder {
  id: string;
  status: "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  paymentDueAt: number | null;
  auctionTitle: string | null;
  createdAt: number;
}

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<MyOrder[]> => {
    if (!context.session) return [];
    const db = getDb();
    const rows = await db
      .select({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentDueAt: order.paymentDueAt,
        createdAt: order.createdAt,
        auctionTitle: auction.title,
      })
      .from(order)
      .leftJoin(auction, eq(order.auctionId, auction.id))
      .where(eq(order.userId, context.session.user.id))
      .orderBy(desc(order.createdAt));

    return rows.map((row) => ({
      id: row.id,
      status: row.status,
      totalAmount: row.totalAmount,
      paymentDueAt: row.paymentDueAt?.getTime() ?? null,
      auctionTitle: row.auctionTitle,
      createdAt: row.createdAt.getTime(),
    }));
  });

const confirmWinPaymentSchema = z.object({ orderId: z.string().min(1) });

export type ConfirmWinPaymentResult = { ok: true } | { ok: false; code: DomainErrorCode; message: string };

export const confirmWinPayment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(confirmWinPaymentSchema)
  .handler(async ({ data, context }): Promise<ConfirmWinPaymentResult> => {
    if (!context.session) {
      return { ok: false, code: "ORDER_NOT_FOUND", message: "Sign in to pay for this order." };
    }
    try {
      await confirmWinPaymentTx(getDb(), { orderId: data.orderId, userId: context.session.user.id });
      return { ok: true };
    } catch (err) {
      if (err instanceof DomainError) return { ok: false, code: err.code, message: err.message };
      throw err;
    }
  });
