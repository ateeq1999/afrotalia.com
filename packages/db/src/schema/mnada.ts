import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

/**
 * Mnada (auction) domain tables. Amounts are whole Tanzanian shillings
 * (TZS has no minor units). Wallet balances are server-controlled only —
 * see spec §11: every mutation must run inside a DB transaction.
 */

export const mnadaAccountStatus = pgEnum("mnada_account_status", [
  "PENDING_PAYMENT",
  "ACTIVE",
  "BLOCKED",
]);

export const productCondition = pgEnum("product_condition", [
  "NEW",
  "USED",
  "WORKING",
  "NOT_WORKING",
]);

export const auctionStatus = pgEnum("auction_status", ["SCHEDULED", "LIVE", "CLOSED"]);

export const walletTransactionKind = pgEnum("wallet_transaction_kind", [
  "DEPOSIT",
  "BID_RESERVATION",
  "BID_RELEASE",
  "AUCTION_PAYMENT",
  "REFUND",
  "REGISTRATION_FEE",
]);

/** Mnada-specific profile attached to the shared Afro Talia user. */
export const mnadaProfile = pgTable(
  "mnada_profile",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    status: mnadaAccountStatus("status").default("PENDING_PAYMENT").notNull(),
    phone: text("phone").unique(),
    nonPaymentViolations: integer("non_payment_violations").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("mnada_profile_phone_idx").on(table.phone)],
);

/** Server-authoritative wallet. One row per user, mutated transactionally. */
export const wallet = pgTable("wallet", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  balance: integer("balance").default(0).notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const walletTransaction = pgTable(
  "wallet_transaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    walletId: text("wallet_id")
      .notNull()
      .references(() => wallet.id, { onDelete: "cascade" }),
    kind: walletTransactionKind("kind").notNull(),
    /** Signed whole-TZS delta applied to the wallet. */
    amount: integer("amount").notNull(),
    /** Balance after applying this transaction (audit trail). */
    balanceAfter: integer("balance_after").notNull(),
    reference: text("reference"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("wallet_transaction_walletId_idx").on(table.walletId)],
);

export const auction = pgTable(
  "auction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lotNumber: integer("lot_number").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    condition: productCondition("condition").notNull(),
    status: auctionStatus("status").default("SCHEDULED").notNull(),
    image: text("image"),
    openingBid: integer("opening_bid").notNull(),
    currentBid: integer("current_bid").default(0).notNull(),
    minimumIncrement: integer("minimum_increment").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at").notNull(),
    winnerId: text("winner_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("auction_status_endsAt_idx").on(table.status, table.endsAt),
    uniqueIndex("auction_lotNumber_uidx").on(table.lotNumber),
  ],
);

/**
 * Bids are append-only. Winner = highest amount; ties break by earliest
 * server-confirmed createdAt — never client timestamps.
 */
export const bid = pgTable(
  "bid",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    auctionId: text("auction_id")
      .notNull()
      .references(() => auction.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("bid_auctionId_createdAt_idx").on(table.auctionId, table.createdAt)],
);

export const shippingAddress = pgTable(
  "shipping_address",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    country: text("country").notNull(),
    region: text("region").notNull(),
    city: text("city").notNull(),
    district: text("district"),
    street: text("street"),
    additional: text("additional"),
    deliveryInstructions: text("delivery_instructions"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("shipping_address_userId_idx").on(table.userId)],
);

/** Admin-configurable Mnada settings (registration fee, violation limit…). */
export const mnadaSetting = pgTable("mnada_setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const mnadaProfileRelations = relations(mnadaProfile, ({ one }) => ({
  user: one(user, {
    fields: [mnadaProfile.userId],
    references: [user.id],
  }),
}));

export const walletRelations = relations(wallet, ({ one, many }) => ({
  user: one(user, {
    fields: [wallet.userId],
    references: [user.id],
  }),
  transactions: many(walletTransaction),
}));

export const auctionRelations = relations(auction, ({ one, many }) => ({
  winner: one(user, {
    fields: [auction.winnerId],
    references: [user.id],
  }),
  bids: many(bid),
}));

export const bidRelations = relations(bid, ({ one }) => ({
  auction: one(auction, {
    fields: [bid.auctionId],
    references: [auction.id],
  }),
  user: one(user, {
    fields: [bid.userId],
    references: [user.id],
  }),
}));
