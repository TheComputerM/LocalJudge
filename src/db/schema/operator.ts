import { Static } from "@sinclair/typebox";
import { relations } from "drizzle-orm";
import {
	integer,
	jsonb,
	pgSchema,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { contestSettingsSchema } from "../typebox/contest";
import { user } from "./auth";
import { userToContest } from "./junction";

export const operatorSchema = pgSchema("operator");

export const contest = operatorSchema.table("contest", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 32 }).notNull(),
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time").notNull(),
	settings: jsonb("settings")
		.$type<Static<typeof contestSettingsSchema>>()
		.notNull(),
});

export const contestRelations = relations(contest, ({ many }) => ({
	problems: many(problem),
	userToContest: many(userToContest),
}));

export const problem = operatorSchema.table("problem", {
	id: uuid("id").primaryKey().defaultRandom(),
	contestId: uuid("contest_id")
		.notNull()
		.references(() => contest.id),
	title: varchar("title", { length: 32 }).notNull(),
	description: text("description").notNull(),
});

export const problemRelations = relations(problem, ({ one, many }) => ({
	contest: one(contest, {
		fields: [problem.contestId],
		references: [contest.id],
	}),
	submissions: many(submission),
	testcases: many(testcase),
}));

/**
 * Represents a test case for a problem in a contest.
 */
export const testcase = operatorSchema.table("testcase", {
	id: uuid("id").primaryKey().defaultRandom(),
	problemId: uuid("problem_id")
		.notNull()
		.references(() => problem.id),
	answer: text("answer").notNull(),
});

export const testcaseRelations = relations(testcase, ({ one, many }) => ({
	problem: one(problem, {
		fields: [testcase.problemId],
		references: [problem.id],
	}),
	results: many(result),
}));

/**
 * Represents a submission made by a user for a problem in a contest.
 */
export const submission = operatorSchema.table("submission", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	problemId: uuid("problem_id")
		.notNull()
		.references(() => problem.id),
	// tokens are used to reference judge0 submissions
	// TODO: maybe look into converting it into a uuidv4 instead of varchar
	tokens: varchar("tokens").array().notNull().default([]),
	input: text("input").notNull(),
	languageId: integer("language_id").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
});

export const submissionRelations = relations(submission, ({ one, many }) => ({
	problem: one(problem, {
		fields: [submission.problemId],
		references: [problem.id],
	}),
	user: one(user, {
		fields: [submission.userId],
		references: [user.id],
	}),
	results: many(result),
}));

/**
 * Represents the result of a submission for a specific test case.
 */
export const result = operatorSchema.table("result", {
	id: uuid("id").primaryKey().defaultRandom(),
	testcaseId: uuid("testcase_id").references(() => testcase.id),
	submissionId: uuid("submission_id").references(() => submission.id),
	status: integer("status").notNull(),
	message: varchar("message", { length: 256 }).notNull(),
});

export const resultRelations = relations(result, ({ one }) => ({
	testcase: one(testcase, {
		fields: [result.testcaseId],
		references: [testcase.id],
	}),
	submission: one(submission, {
		fields: [result.submissionId],
		references: [submission.id],
	}),
}));
