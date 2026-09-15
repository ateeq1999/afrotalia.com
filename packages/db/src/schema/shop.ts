import { relations } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { order } from "./mnada";

/**
 * Shop (fixed-price commerce) domain tables. Amounts are whole Tanzanian
 * shillings, matching the rest of the schema. `order`/`orderStatus` is
 * shared with Mnada — see schema/mnada.ts. `shopProductCondition` is its
 * own enum: Mnada's `productCondition` includes "WORKING" as a condition
 * value, but Shop's badge is NEW / USED / NOT_WORKING with `isWorking` as a
 * separate denormalized bool (`isWorking = condition !== 'NOT_WORKING'`,
 * kept for cheap filtering without a string comparison).
 */

export const shopProductCondition = pgEnum("shop_product_condition", ["NEW", "USED", "NOT_WORKING"]);
export const paymentStatus = pgEnum("payment_status", ["PENDING", "SUCCEEDED", "FAILED"]);
export const paymentMethod = pgEnum("payment_method", ["mpesa", "card", "bank"]);
export const paymentEventKind = pgEnum("payment_event_kind", ["CAPTURED", "RELEASED", "REFUNDED"]);

export const category = pgTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const product = pgTable(
  "product",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    sku: text("sku").notNull().unique(),
    description: text("description").notNull(),
    condition: shopProductCondition("condition").notNull(),
    isWorking: boolean("is_working").notNull().default(true),
    stock: integer("stock").default(0).notNull(),
    price: integer("price").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("product_categoryId_idx").on(table.categoryId),
    index("product_condition_idx").on(table.condition),
  ],
);

export const cartItem = pgTable(
  "cart_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("cart_item_userId_productId_uidx").on(table.userId, table.productId)],
);

export const deliveryMethod = pgTable("delivery_method", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  fee: integer("fee").notNull(),
  etaLabel: text("eta_label").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Order lines. `productId` is nullable so a deleted product doesn't break order history. */
export const orderItem = pgTable(
  "order_item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => product.id, { onDelete: "set null" }),
    productName: text("product_name").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("order_item_orderId_idx").on(table.orderId)],
);

/** One row per charge attempt. Provider-agnostic: method + external ref + status. */
export const payment = pgTable(
  "payment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    method: paymentMethod("method").notNull(),
    externalRef: text("external_ref").notNull(),
    amount: integer("amount").notNull(),
    status: paymentStatus("status").default("PENDING").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("payment_orderId_idx").on(table.orderId)],
);

/**
 * Escrow as an immutable ledger, not a mutable flag: CAPTURED at checkout,
 * RELEASED on delivery confirmation.
 */
export const paymentEvent = pgTable(
  "payment_event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    paymentId: text("payment_id")
      .notNull()
      .references(() => payment.id, { onDelete: "cascade" }),
    kind: paymentEventKind("kind").notNull(),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("payment_event_paymentId_idx").on(table.paymentId)],
);

export const categoryRelations = relations(category, ({ many }) => ({
  products: many(product),
}));

export const productRelations = relations(product, ({ one }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  user: one(user, {
    fields: [cartItem.userId],
    references: [user.id],
  }),
  product: one(product, {
    fields: [cartItem.productId],
    references: [product.id],
  }),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one, many }) => ({
  order: one(order, {
    fields: [payment.orderId],
    references: [order.id],
  }),
  events: many(paymentEvent),
}));

export const paymentEventRelations = relations(paymentEvent, ({ one }) => ({
  payment: one(payment, {
    fields: [paymentEvent.paymentId],
    references: [payment.id],
  }),
}));
