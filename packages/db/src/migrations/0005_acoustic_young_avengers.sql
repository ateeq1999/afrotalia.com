CREATE TABLE "team_member" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"bio" text,
	"portrait" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service" ALTER COLUMN "summary" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "auction" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "cms_page" ADD COLUMN "eyebrow" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "kind" text NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "preview" text;--> statement-breakpoint
ALTER TABLE "service" ADD COLUMN "body" text;--> statement-breakpoint
CREATE INDEX "team_member_sortOrder_idx" ON "team_member" USING btree ("sort_order");