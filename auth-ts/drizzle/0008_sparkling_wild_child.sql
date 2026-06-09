CREATE TABLE "shortcodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"short_code" varchar(6) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "redirect_uri" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "client_secret" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shortcodes" ADD CONSTRAINT "shortcodes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;