CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "operator";
--> statement-breakpoint
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
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"settings" jsonb NOT NULL,
	CONSTRAINT "time_check" CHECK ("operator"."contest"."start_time" < "operator"."contest"."end_time")
);
--> statement-breakpoint
CREATE TABLE "operator"."problem" (
	"id" text PRIMARY KEY GENERATED ALWAYS AS ("operator"."problem"."contest_id" || '/' || "operator"."problem"."number") STORED NOT NULL,
	"contest_id" text NOT NULL,
	"number" smallint NOT NULL,
	"title" varchar(32) NOT NULL,
	"description" text NOT NULL,
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
	"testcase_id" text,
	"submission_id" uuid,
	"status" integer NOT NULL,
	"message" varchar(256) NOT NULL,
	CONSTRAINT "result_testcase_id_submission_id_pk" PRIMARY KEY("testcase_id","submission_id")
);
--> statement-breakpoint
CREATE TABLE "operator"."submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"problem_id" text NOT NULL,
	"input" text NOT NULL,
	"language" varchar(16) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operator"."testcase" (
	"id" text PRIMARY KEY GENERATED ALWAYS AS ("operator"."testcase"."problem_id" || '/' || "operator"."testcase"."number") STORED NOT NULL,
	"number" smallint NOT NULL,
	"problem_id" text NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"input" text NOT NULL,
	"output" text NOT NULL,
	CONSTRAINT "valid_number" CHECK ("operator"."testcase"."number" > 0)
);
--> statement-breakpoint
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator"."problem" ADD CONSTRAINT "problem_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "operator"."contest"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator"."registration" ADD CONSTRAINT "registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator"."registration" ADD CONSTRAINT "registration_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "operator"."contest"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator"."result" ADD CONSTRAINT "result_testcase_id_testcase_id_fk" FOREIGN KEY ("testcase_id") REFERENCES "operator"."testcase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator"."result" ADD CONSTRAINT "result_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "operator"."submission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator"."submission" ADD CONSTRAINT "submission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator"."submission" ADD CONSTRAINT "submission_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "operator"."problem"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator"."testcase" ADD CONSTRAINT "testcase_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "operator"."problem"("id") ON DELETE no action ON UPDATE no action;