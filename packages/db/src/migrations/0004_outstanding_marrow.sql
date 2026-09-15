CREATE TABLE "cms_page" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text,
	"body" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cms_page_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enquiry" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'NEW' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"image" text,
	"client_name" text,
	"outcome" text,
	"completed_at" timestamp,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "service_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "enquiry_email_createdAt_idx" ON "enquiry" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "project_sortOrder_idx" ON "project" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "service_sortOrder_idx" ON "service" USING btree ("sort_order");