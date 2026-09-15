import { addToCart as addToCartTx, getCart, removeFromCart as removeFromCartTx, setCartItemQuantity } from "@afrotalia/core/shop/cart";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getDb } from "@/services";

export interface CartView {
  lines: {
    productId: string;
    productName: string;
    slug: string;
    image: string | null;
    unitPrice: number;
    quantity: number;
    stock: number;
  }[];
  itemsTotal: number;
}

export const getMyCart = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CartView> => {
    if (!context.session) return { lines: [], itemsTotal: 0 };
    const lines = await getCart(getDb(), context.session.user.id);
    return { lines, itemsTotal: lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0) };
  });

const addToCartSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().positive().max(99) });

export const addToCart = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(addToCartSchema)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    if (!context.session) return { ok: false };
    await addToCartTx(getDb(), { userId: context.session.user.id, productId: data.productId, quantity: data.quantity });
    return { ok: true };
  });

const updateCartItemSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(0).max(99) });

export const updateCartItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateCartItemSchema)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    if (!context.session) return { ok: false };
    await setCartItemQuantity(getDb(), { userId: context.session.user.id, productId: data.productId, quantity: data.quantity });
    return { ok: true };
  });

const removeFromCartSchema = z.object({ productId: z.string().min(1) });

export const removeFromCart = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(removeFromCartSchema)
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    if (!context.session) return { ok: false };
    await removeFromCartTx(getDb(), { userId: context.session.user.id, productId: data.productId });
    return { ok: true };
  });
