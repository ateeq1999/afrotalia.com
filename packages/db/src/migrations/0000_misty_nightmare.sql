CREATE TYPE "public"."auction_status" AS ENUM('SCHEDULED', 'LIVE', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."mnada_account_status" AS ENUM('PENDING_PAYMENT', 'ACTIVE', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."product_condition" AS ENUM('NEW', 'USED', 'WORKING', 'NOT_WORKING');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_kind" AS ENUM('DEPOSIT', 'BID_RESERVATION', 'BID_RELEASE', 'AUCTION_PAYMENT', 'REFUND', 'REGISTRATION_FEE');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auction" (
	"id" text PRIMARY KEY NOT NULL,
	"lot_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"condition" "product_condition" NOT NULL,
	"status" "auction_status" DEFAULT 'SCHEDULED' NOT NULL,
	"image" text,
	"opening_bid" integer NOT NULL,
	"current_bid" integer DEFAULT 0 NOT NULL,
	"minimum_increment" integer NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"winner_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auction_lot_number_unique" UNIQUE("lot_number")
);
--> statement-breakpoint
CREATE TABLE "bid" (
	"id" text PRIMARY KEY NOT NULL,
	"auction_id" text NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mnada_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" "mnada_account_status" DEFAULT 'PENDING_PAYMENT' NOT NULL,
	"phone" text,
	"non_payment_violations" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mnada_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "mnada_profile_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "mnada_setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_address" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"country" text NOT NULL,
	"region" text NOT NULL,
	"city" text NOT NULL,
	"district" text,
	"street" text,
	"additional" text,
	"delivery_instructions" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallet" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "wallet_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"kind" "wallet_transaction_kind" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reference" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auction" ADD CONSTRAINT "auction_winner_id_user_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid" ADD CONSTRAINT "bid_auction_id_auction_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bid" ADD CONSTRAINT "bid_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mnada_profile" ADD CONSTRAINT "mnada_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_address" ADD CONSTRAINT "shipping_address_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_providerId_accountId_uidx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "auction_status_endsAt_idx" ON "auction" USING btree ("status","ends_at");--> statement-breakpoint
CREATE UNIQUE INDEX "auction_lotNumber_uidx" ON "auction" USING btree ("lot_number");--> statement-breakpoint
CREATE INDEX "bid_auctionId_createdAt_idx" ON "bid" USING btree ("auction_id","created_at");--> statement-breakpoint
CREATE INDEX "mnada_profile_phone_idx" ON "mnada_profile" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "shipping_address_userId_idx" ON "shipping_address" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wallet_transaction_walletId_idx" ON "wallet_transaction" USING btree ("wallet_id");