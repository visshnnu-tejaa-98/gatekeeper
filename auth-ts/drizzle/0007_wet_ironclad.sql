ALTER TABLE "applications" ADD COLUMN "client_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "client_secret" text NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "updated_at" timestamp;