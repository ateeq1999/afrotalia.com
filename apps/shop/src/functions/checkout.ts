import { DomainError, type DomainErrorCode } from "@afrotalia/core";
import { getCart } from "@afrotalia/core/shop/cart";
import { checkout as checkoutTx } from "@afrotalia/core/shop/checkout";
import { shippingAddress } from "@afrotalia/db/schema/mnada";
import { deliveryMethod } from "@afrotalia/db/schema/shop";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { authMiddleware } from "@/middleware/auth";
import { getDb } from "@/services";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  district: string | null;
  street: string | null;
  additional: string | null;
}

export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  fee: number;
  etaLabel: string;
}

export interface CheckoutContext {
  addresses: Address[];
  deliveryMethods: DeliveryOption[];
  itemsTotal: number;
  itemCount: number;
}

export const getCheckoutContext = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<CheckoutContext> => {
    if (!context.session) return { addresses: [], deliveryMethods: [], itemsTotal: 0, itemCount: 0 };
    const db = getDb();
    const [addresses, methods, cart] = await Promise.all([
      db.select().from(shippingAddress).where(eq(shippingAddress.userId, context.session.user.id)),
      db.select().from(deliveryMethod).where(eq(deliveryMethod.active, true)).orderBy(asc(deliveryMethod.fee)),
      getCart(db, context.session.user.id),
    ]);
    return {
      addresses,
      deliveryMethods: methods,
      itemsTotal: cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
      itemCount: cart.reduce((sum, l) => sum + l.quantity, 0),
    };
  });

const addAddressSchema = z.object({
  fullName: z.string().min(1).max(200),
  phone: z.string().min(6).max(30),
  country: z.string().min(1).max(100),
  region: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  district: z.string().max(100).optional(),
  street: z.string().max(200).optional(),
  additional: z.string().max(200).optional(),
});

export const addAddress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(addAddressSchema)
  .handler(async ({ data, context }): Promise<{ id: string } | null> => {
    if (!context.session) return null;
    const [row] = await getDb()
      .insert(shippingAddress)
      .values({ userId: context.session.user.id, ...data })
      .returning({ id: shippingAddress.id });
    return row ?? null;
  });

const placeOrderSchema = z.object({
  addressId: z.string().min(1),
  deliveryMethodId: z.string().min(1),
  paymentMethod: z.enum(["mpesa", "card", "bank"]),
});

export type PlaceOrderResult =
  | { ok: true; orderId: string; total: number }
  | { ok: false; code: DomainErrorCode; message: string };

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(placeOrderSchema)
  .handler(async ({ data, context }): Promise<PlaceOrderResult> => {
    if (!context.session) {
      return { ok: false, code: "ORDER_NOT_FOUND", message: "Sign in to check out." };
    }
    try {
      const result = await checkoutTx(getDb(), {
        userId: context.session.user.id,
        addressId: data.addressId,
        deliveryMethodId: data.deliveryMethodId,
        paymentMethod: data.paymentMethod,
      });
      return { ok: true, ...result };
    } catch (err) {
      if (err instanceof DomainError) return { ok: false, code: err.code, message: err.message };
      throw err;
    }
  });
