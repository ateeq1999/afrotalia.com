import { DomainError, type DomainErrorCode } from "@afrotalia/core";
import { confirmDelivery as confirmDeliveryTx } from "@afrotalia/core/shop/confirm-delivery";
import { order } from "@afrotalia/db/schema/mnada";
import { orderItem } from "@afrotalia/db/schema/shop";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getDb } from "@/services";

export interface ShopOrder {
  id: string;
  status: "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: number;
  items: { productName: string; unitPrice: number; quantity: number }[];
}

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ShopOrder[]> => {
    if (!context.session) return [];
    const db = getDb();
    const orders = await db
      .select()
      .from(order)
      .where(eq(order.userId, context.session.user.id))
      .orderBy(desc(order.createdAt));
    const shopOrders = orders.filter((o) => o.type === "SHOP_ORDER");

    const items = await Promise.all(
      shopOrders.map((o) =>
        db
          .select({ productName: orderItem.productName, unitPrice: orderItem.unitPrice, quantity: orderItem.quantity })
          .from(orderItem)
          .where(eq(orderItem.orderId, o.id)),
      ),
    );

    return shopOrders.map((o, i) => ({
      id: o.id,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt.getTime(),
      items: items[i] ?? [],
    }));
  });

const confirmDeliverySchema = z.object({ orderId: z.string().min(1) });

export type ConfirmDeliveryResult = { ok: true } | { ok: false; code: DomainErrorCode; message: string };

export const confirmDelivery = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(confirmDeliverySchema)
  .handler(async ({ data, context }): Promise<ConfirmDeliveryResult> => {
    if (!context.session) {
      return { ok: false, code: "ORDER_NOT_FOUND", message: "Sign in to confirm delivery." };
    }
    try {
      await confirmDeliveryTx(getDb(), { orderId: data.orderId, userId: context.session.user.id });
      return { ok: true };
    } catch (err) {
      if (err instanceof DomainError) return { ok: false, code: err.code, message: err.message };
      throw err;
    }
  });
