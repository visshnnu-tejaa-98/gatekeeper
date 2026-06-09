ALTER TABLE "applications" DROP CONSTRAINT "applications_client_id_unique";--> statement-breakpoint
ALTER TABLE "shortcodes" DROP CONSTRAINT "shortcodes_client_id_applications_client_id_fk";
--> statement-breakpoint
ALTER TABLE "shortcodes" ALTER COLUMN "client_id" SET DATA TYPE text;