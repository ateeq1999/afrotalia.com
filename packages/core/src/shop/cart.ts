import type { Database } from "@afrotalia/db";
import { cartItem, product } from "@afrotalia/db/schema/shop";
import { and, eq } from "drizzle-orm";

import { DomainError } from "../errors";

export interface CartLineView {
  productId: string;
  productName: string;
  slug: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
}

export async function getCart(db: Database, userId: string): Promise<CartLineView[]> {
  const rows = await db
    .select({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      image: product.image,
      unitPrice: product.price,
      stock: product.stock,
      quantity: cartItem.quantity,
    })
    .from(cartItem)
    .innerJoin(product, eq(cartItem.productId, product.id))
    .where(eq(cartItem.userId, userId));
  return rows;
}

/** Adds `quantity` to the existing line (or creates one), clamped to available stock. */
export async function addToCart(
  db: Database,
  params: { userId: string; productId: string; quantity: number },
): Promise<void> {
  await db.transaction(async (tx) => {
    const [productRow] = await tx.select().from(product).where(eq(product.id, params.productId)).limit(1);
    if (!productRow || productRow.stock <= 0) throw new DomainError("OUT_OF_STOCK");

    const [existing] = await tx
      .select()
      .from(cartItem)
      .where(and(eq(cartItem.userId, params.userId), eq(cartItem.productId, params.productId)))
      .limit(1);

    const nextQuantity = Math.min(productRow.stock, (existing?.quantity ?? 0) + params.quantity);
    if (existing) {
      await tx.update(cartItem).set({ quantity: nextQuantity }).where(eq(cartItem.id, existing.id));
    } else {
      await tx.insert(cartItem).values({ userId: params.userId, productId: params.productId, quantity: nextQuantity });
    }
  });
}

export async function setCartItemQuantity(
  db: Database,
  params: { userId: string; productId: string; quantity: number },
): Promise<void> {
  if (params.quantity <= 0) {
    await db
      .delete(cartItem)
      .where(and(eq(cartItem.userId, params.userId), eq(cartItem.productId, params.productId)));
    return;
  }
  await db.transaction(async (tx) => {
    const [productRow] = await tx.select().from(product).where(eq(product.id, params.productId)).limit(1);
    if (!productRow) throw new DomainError("OUT_OF_STOCK");
    const clamped = Math.min(productRow.stock, params.quantity);
    await tx
      .update(cartItem)
      .set({ quantity: clamped })
      .where(and(eq(cartItem.userId, params.userId), eq(cartItem.productId, params.productId)));
  });
}

export async function removeFromCart(db: Database, params: { userId: string; productId: string }): Promise<void> {
  await db.delete(cartItem).where(and(eq(cartItem.userId, params.userId), eq(cartItem.productId, params.productId)));
}
