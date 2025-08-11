CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "operator";
--> statement-breakpoint
CREATE TYPE "operator"."status" AS ENUM('passed', 'incorrect_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error', 'runtime_error');--> statement-breakpoint
CREATE TABLE "auth"."account" (
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
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "auth"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "operator"."contest" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(48) NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"settings" jsonb NOT NULL,
	CONSTRAINT "time_check" CHECK ("operator"."contest"."start_time" < "operator"."contest"."end_time")
);
--> statement-breakpoint
CREATE TABLE "operator"."problem" (
	"contest_id" text NOT NULL,
	"number" smallint NOT NULL,
	"title" varchar(32) NOT NULL,
	"description" text NOT NULL,
	"time_limit" integer DEFAULT 1000 NOT NULL,
	"memory_limit" integer DEFAULT 256 NOT NULL,
	CONSTRAINT "problem_contest_id_number_pk" PRIMARY KEY("contest_id","number"),
	CONSTRAINT "valid_number" CHECK ("operator"."problem"."number" > 0)
);
--> statement-breakpoint
CREATE TABLE "operator"."registration" (
	"user_id" text NOT NULL,
	"contest_id" text NOT NULL,
	CONSTRAINT "registration_user_id_contest_id_pk" PRIMARY KEY("user_id","contest_id")
);
--> statement-breakpoint
CREATE TABLE "operator"."result" (
	"submission_id" uuid NOT NULL,
	"testcase_number" smallint NOT NULL,
	"time" integer NOT NULL,
	"memory" integer NOT NULL,
	"status" "operator"."status" NOT NULL,
	"message" text NOT NULL,
	CONSTRAINT "result_submission_id_testcase_number_pk" PRIMARY KEY("submission_id","testcase_number")
);
--> statement-breakpoint
CREATE TABLE "operator"."submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"contest_id" text NOT NULL,
	"problem_number" smallint NOT NULL,
	"code" text NOT NULL,
	"language" varchar(24) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operator"."testcase" (
	"contest_id" text NOT NULL,
	"problem_number" smallint NOT NULL,
	"number" smallint NOT NULL,
	"points" integer DEFAULT 25 NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"input" text NOT NULL,
	"output" text NOT NULL,
	CONSTRAINT "testcase_contest_id_problem_number_number_pk" PRIMARY KEY("contest_id","problem_number","number"),
	CONSTRAINT "valid_number" CHECK ("operator"."testcase"."number" > 0)
);
--> statement-breakpoint
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator"."problem" ADD CONSTRAINT "problem_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "operator"."contest"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "operator"."registration" ADD CONSTRAINT "registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "operator"."registration" ADD CONSTRAINT "registration_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "operator"."contest"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "operator"."result" ADD CONSTRAINT "result_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "operator"."submission"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "operator"."submission" ADD CONSTRAINT "submission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "operator"."submission" ADD CONSTRAINT "submission_contest_id_problem_number_problem_contest_id_number_fk" FOREIGN KEY ("contest_id","problem_number") REFERENCES "operator"."problem"("contest_id","number") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "operator"."testcase" ADD CONSTRAINT "testcase_contest_id_problem_number_problem_contest_id_number_fk" FOREIGN KEY ("contest_id","problem_number") REFERENCES "operator"."problem"("contest_id","number") ON DELETE cascade ON UPDATE cascade;