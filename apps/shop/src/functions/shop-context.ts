import { cartItem } from "@afrotalia/db/schema/shop";
import { createServerFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";

import { authMiddleware } from "@/middleware/auth";
import { getDb } from "@/services";

export interface ShopHeaderContext {
  signedIn: boolean;
  cartCount: number;
}

export const getShopHeaderContext = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ShopHeaderContext> => {
    if (!context.session) return { signedIn: false, cartCount: 0 };
    const [row] = await getDb()
      .select({ total: sql<number>`coalesce(sum(${cartItem.quantity}), 0)`.mapWith(Number) })
      .from(cartItem)
      .where(eq(cartItem.userId, context.session.user.id));
    return { signedIn: true, cartCount: row?.total ?? 0 };
  });
