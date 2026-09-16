import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Corporate site (apps/web) domain tables. Company facts (registration
 * numbers, founding dates, staff names, addresses, phone numbers, client
 * names, project outcomes) are never hard-coded in app code — they come
 * from these tables, and the UI renders a clearly-marked "Supplied by
 * Afrotalia" empty state until a row supplies them. See README "Corporate
 * site" section and afrotalia-web-content.md.
 */

/**
 * Free-form content blocks keyed by slug, e.g. "home.hero", "about.mission".
 * `eyebrow`/`title`/`body` cover the vast majority of sections (a small
 * label, a headline, and a paragraph); sections needing more structure
 * (numbered lists, repeating records) use one row per item instead
 * (`home.why.1`, `home.why.2`, …).
 */
export const cmsPage = pgTable("cms_page", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  eyebrow: text("eyebrow"),
  title: text("title"),
  body: text("body"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/** The five fixed service categories. `preview` is the short teaser used on Home; `body` is the full copy on /services. */
export const service = pgTable(
  "service",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    preview: text("preview").notNull(),
    body: text("body").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("service_sortOrder_idx").on(table.sortOrder)],
);

/**
 * Case study. `clientName`, `outcome`, `scope` and `image` are nullable on
 * purpose — no project is seeded with invented client names or outcomes;
 * the page shows an empty state until real ones are supplied through the
 * CMS.
 */
export const project = pgTable(
  "project",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    kind: text("kind").notNull(),
    summary: text("summary").notNull(),
    scope: text("scope"),
    image: text("image"),
    clientName: text("client_name"),
    outcome: text("outcome"),
    featured: boolean("featured").default(false).notNull(),
    completedAt: timestamp("completed_at"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("project_sortOrder_idx").on(table.sortOrder)],
);

/**
 * Leadership record. Genuinely empty at seed time (spec: "render nothing
 * until supplied — no silhouettes, no invented titles") — the table exists
 * so the /about page and a future admin CMS have somewhere real to write
 * to, not to hold placeholder rows.
 */
export const teamMember = pgTable(
  "team_member",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    role: text("role").notNull(),
    bio: text("bio"),
    portrait: text("portrait"),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [index("team_member_sortOrder_idx").on(table.sortOrder)],
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
