ALTER TABLE "operator"."submission" ADD COLUMN "language" varchar(16) NOT NULL;--> statement-breakpoint
ALTER TABLE "operator"."submission" ADD COLUMN "language_version" varchar(16) NOT NULL;--> statement-breakpoint
ALTER TABLE "operator"."submission" DROP COLUMN "tokens";--> statement-breakpoint
ALTER TABLE "operator"."submission" DROP COLUMN "language_id";