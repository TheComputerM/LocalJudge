CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "localjudge";
--> statement-breakpoint
CREATE TYPE "localjudge"."status" AS ENUM('CA', 'WA', 'RE', 'CE', 'XX');--> statement-breakpoint
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
CREATE TABLE "localjudge"."contest" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(48) NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"settings" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "time_check" CHECK ("localjudge"."contest"."start_time" < "localjudge"."contest"."end_time")
);
--> statement-breakpoint
CREATE TABLE "localjudge"."problem" (
	"contest_id" text NOT NULL,
	"number" smallint NOT NULL,
	"title" varchar(32) NOT NULL,
	"description" text NOT NULL,
	"time_limit" integer DEFAULT 1000 NOT NULL,
	"memory_limit" integer DEFAULT 256 NOT NULL,
	CONSTRAINT "problem_contest_id_number_pk" PRIMARY KEY("contest_id","number"),
	CONSTRAINT "valid_number" CHECK ("localjudge"."problem"."number" > 0)
);
--> statement-breakpoint
CREATE TABLE "localjudge"."registration" (
	"user_id" text NOT NULL,
	"contest_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "registration_user_id_contest_id_pk" PRIMARY KEY("user_id","contest_id")
);
--> statement-breakpoint
CREATE TABLE "localjudge"."result" (
	"submission_id" uuid NOT NULL,
	"testcase_number" smallint NOT NULL,
	"status" "localjudge"."status" NOT NULL,
	"time" integer NOT NULL,
	"memory" integer NOT NULL,
	"stdout" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "result_submission_id_testcase_number_pk" PRIMARY KEY("submission_id","testcase_number")
);
--> statement-breakpoint
CREATE TABLE "localjudge"."snapshot" (
	"user_id" text NOT NULL,
	"contest_id" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "snapshot_user_id_contest_id_pk" PRIMARY KEY("user_id","contest_id")
);
--> statement-breakpoint
CREATE TABLE "localjudge"."submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"contest_id" text NOT NULL,
	"problem_number" smallint NOT NULL,
	"content" text NOT NULL,
	"language" varchar(24) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "localjudge"."testcase" (
	"contest_id" text NOT NULL,
	"problem_number" smallint NOT NULL,
	"number" smallint NOT NULL,
	"hidden" boolean DEFAULT false NOT NULL,
	"input" text NOT NULL,
	"output" text NOT NULL,
	CONSTRAINT "testcase_contest_id_problem_number_number_pk" PRIMARY KEY("contest_id","problem_number","number"),
	CONSTRAINT "valid_number" CHECK ("localjudge"."testcase"."number" > 0)
);
--> statement-breakpoint
CREATE TABLE "localjudge"."timeline" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"contest_id" text NOT NULL,
	"patch" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "localjudge"."problem" ADD CONSTRAINT "problem_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "localjudge"."contest"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."registration" ADD CONSTRAINT "registration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."registration" ADD CONSTRAINT "registration_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "localjudge"."contest"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."result" ADD CONSTRAINT "result_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "localjudge"."submission"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."snapshot" ADD CONSTRAINT "snapshot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."snapshot" ADD CONSTRAINT "snapshot_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "localjudge"."contest"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."submission" ADD CONSTRAINT "submission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."submission" ADD CONSTRAINT "submission_contest_id_problem_number_problem_contest_id_number_fk" FOREIGN KEY ("contest_id","problem_number") REFERENCES "localjudge"."problem"("contest_id","number") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."testcase" ADD CONSTRAINT "testcase_contest_id_problem_number_problem_contest_id_number_fk" FOREIGN KEY ("contest_id","problem_number") REFERENCES "localjudge"."problem"("contest_id","number") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."timeline" ADD CONSTRAINT "timeline_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "localjudge"."timeline" ADD CONSTRAINT "timeline_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "localjudge"."contest"("id") ON DELETE cascade ON UPDATE cascade;