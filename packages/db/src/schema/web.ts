import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Corporate site (apps/web) domain tables. Company facts (registration
 * numbers, founding dates, staff names, addresses, phone numbers, client
 * names, project outcomes) are never hard-coded in app code — they come
 * from these tables, and the UI renders a clearly-marked empty state until
 * a row supplies them. See README "Corporate site" section.
 */

/** Free-form content blocks keyed by slug, e.g. "about.intro", "why-afrotalia". */
export const cmsPage = pgTable("cms_page", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title"),
  body: text("body"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/** The five fixed service categories, admin-editable copy/ordering. */
export const service = pgTable(
  "service",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("service_sortOrder_idx").on(table.sortOrder)],
);

/**
 * Featured project. `clientName` and `outcome` are nullable on purpose — no
 * project is seeded with invented client names or outcomes; the page shows
 * an empty state until real ones are supplied through the CMS.
 */
export const project = pgTable(
  "project",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary").notNull(),
    image: text("image"),
    clientName: text("client_name"),
    outcome: text("outcome"),
    completedAt: timestamp("completed_at"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("project_sortOrder_idx").on(table.sortOrder)],
);

export const enquiryStatus = ["NEW", "READ"] as const;

/** Contact form submissions. */
export const enquiry = pgTable(
  "enquiry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    message: text("message").notNull(),
    status: text("status", { enum: enquiryStatus }).default("NEW").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("enquiry_email_createdAt_idx").on(table.email, table.createdAt)],
);
