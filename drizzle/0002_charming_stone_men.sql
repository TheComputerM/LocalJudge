CREATE TYPE "operator"."status" AS ENUM('passed', 'incorrect_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error', 'runtime_error');--> statement-breakpoint
ALTER TABLE "operator"."result" ALTER COLUMN "status" SET DATA TYPE "operator"."status" USING "status"::"operator"."status";--> statement-breakpoint
ALTER TABLE "operator"."result" ALTER COLUMN "message" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "operator"."result" ADD COLUMN "time" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "operator"."result" ADD COLUMN "memory" integer DEFAULT 0 NOT NULL;