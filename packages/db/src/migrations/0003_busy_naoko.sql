CREATE TYPE "public"."payment_event_kind" AS ENUM('CAPTURED', 'RELEASED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('mpesa', 'card', 'bank');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."shop_product_condition" AS ENUM('NEW', 'USED', 'NOT_WORKING');--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "delivery_method" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"fee" integer NOT NULL,
	"eta_label" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"product_name" text NOT NULL,
	"unit_price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"method" "payment_method" NOT NULL,
	"external_ref" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_event" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_id" text NOT NULL,
	"kind" "payment_event_kind" NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sku" text NOT NULL,
	"description" text NOT NULL,
	"condition" "shop_product_condition" NOT NULL,
	"is_working" boolean DEFAULT true NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"price" integer NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug"),
	CONSTRAINT "product_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_event" ADD CONSTRAINT "payment_event_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_item_userId_productId_uidx" ON "cart_item" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "order_item_orderId_idx" ON "order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_orderId_idx" ON "payment" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_event_paymentId_idx" ON "payment_event" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "product_categoryId_idx" ON "product" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_condition_idx" ON "product" USING btree ("condition");