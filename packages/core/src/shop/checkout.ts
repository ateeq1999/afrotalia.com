import type { Database } from "@afrotalia/db";
import { order, shippingAddress } from "@afrotalia/db/schema/mnada";
import { cartItem, deliveryMethod, orderItem, payment, paymentEvent, product } from "@afrotalia/db/schema/shop";
import { eq } from "drizzle-orm";

import { DomainError } from "../errors";
import { logAudit } from "../mnada/db-helpers";
import { mockCharge, type PaymentMethod } from "../payments/mock-provider";
import { computeOrderTotal, outOfStockLines } from "./cart-rules";

export interface CheckoutParams {
  userId: string;
  addressId: string;
  deliveryMethodId: string;
  paymentMethod: PaymentMethod;
}

export interface CheckoutResult {
  orderId: string;
  total: number;
}

/**
 * Creates a SHOP_ORDER from the user's cart. The total is always
 * recomputed here from current product prices and the delivery fee — a
 * client-sent total is never trusted. Decrements stock, captures the mock
 * payment, and clears the cart, all in one transaction.
 */
export async function checkout(db: Database, params: CheckoutParams): Promise<CheckoutResult> {
  return db.transaction(async (tx) => {
    const [address] = await tx
      .select()
      .from(shippingAddress)
      .where(eq(shippingAddress.id, params.addressId))
      .limit(1);
    if (!address || address.userId !== params.userId) throw new DomainError("ADDRESS_NOT_FOUND");

    const [delivery] = await tx
      .select()
      .from(deliveryMethod)
      .where(eq(deliveryMethod.id, params.deliveryMethodId))
      .limit(1);
    if (!delivery || !delivery.active) throw new DomainError("DELIVERY_METHOD_NOT_FOUND");

    const cartRows = await tx
      .select({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        stock: product.stock,
        quantity: cartItem.quantity,
      })
      .from(cartItem)
      .innerJoin(product, eq(cartItem.productId, product.id))
      .where(eq(cartItem.userId, params.userId));

    if (cartRows.length === 0) throw new DomainError("CART_EMPTY");
    if (outOfStockLines(cartRows).length > 0) throw new DomainError("OUT_OF_STOCK");

    const { total } = computeOrderTotal(cartRows, delivery.fee);

    for (const row of cartRows) {
      await tx
        .update(product)
        .set({ stock: row.stock - row.quantity })
        .where(eq(product.id, row.productId));
    }

    const [insertedOrder] = await tx
      .insert(order)
      .values({
        userId: params.userId,
        type: "SHOP_ORDER",
        status: "PROCESSING",
        totalAmount: total,
      })
      .returning({ id: order.id });
    const orderId = insertedOrder!.id;

    await tx.insert(orderItem).values(
      cartRows.map((row) => ({
        orderId,
        productId: row.productId,
        productName: row.productName,
        unitPrice: row.unitPrice,
        quantity: row.quantity,
      })),
    );

    const charge = await mockCharge({ method: params.paymentMethod, amountMinor: total });
    const [insertedPayment] = await tx
      .insert(payment)
      .values({
        orderId,
        method: params.paymentMethod,
        externalRef: charge.reference,
        amount: total,
        status: "SUCCEEDED",
      })
      .returning({ id: payment.id });
    await tx.insert(paymentEvent).values({
      paymentId: insertedPayment!.id,
      kind: "CAPTURED",
      amount: total,
    });

    await tx.delete(cartItem).where(eq(cartItem.userId, params.userId));

    await logAudit(tx, {
      actorUserId: params.userId,
      entityType: "order",
      entityId: orderId,
      action: "SHOP_ORDER_PLACED",
      metadata: { total, items: cartRows.length },
    });

    return { orderId, total };
  });
}
