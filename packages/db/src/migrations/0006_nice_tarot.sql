ALTER TABLE "service" ALTER COLUMN "preview" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "service" ALTER COLUMN "body" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "service" DROP COLUMN "summary";