import { Static } from "@sinclair/typebox";
import { relations, type SQL, sql } from "drizzle-orm";
import {
	check,
	integer,
	jsonb,
	pgSchema,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { contestSettingsSchema } from "../typebox/contest";
import { user } from "./auth";

export const operatorSchema = pgSchema("operator");

export const contest = operatorSchema.table(
	"contest",
	{
		id: text("id")
			.$default(() => nanoid(12))
			.primaryKey(),
		name: varchar("name", { length: 48 }).notNull(),
		startTime: timestamp("start_time").notNull(),
		endTime: timestamp("end_time").notNull(),
		settings: jsonb("settings")
			.$type<Static<typeof contestSettingsSchema>>()
			.notNull(),
	},
	(table) => [check("time_check", sql`${table.startTime} < ${table.endTime}`)],
);

export const contestRelations = relations(contest, ({ many }) => ({
	problems: many(problem),
	registrations: many(registration),
}));

export const userRelations = relations(user, ({ many }) => ({
	submissions: many(submission),
	registrations: many(registration),
}));

/**
 * Each row in this table indicates that a user has registered for a specific contest.
 * The composite primary key ensures that a user cannot register for the same contest more than once.
 */
export const registration = operatorSchema.table(
	"registration",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		contestId: text("contest_id")
			.notNull()
			.references(() => contest.id),
	},
	(t) => [primaryKey({ columns: [t.userId, t.contestId] })],
);

export const registrationRelations = relations(registration, ({ one }) => ({
	contest: one(contest, {
		fields: [registration.contestId],
		references: [contest.id],
	}),
	user: one(user, {
		fields: [registration.userId],
		references: [user.id],
	}),
}));

export const problem = operatorSchema.table(
	"problem",
	{
		id: text("id")
			.generatedAlwaysAs(
				(): SQL => sql`${problem.contestId} || '/' || ${problem.index}`,
			)
			.primaryKey(),
		contestId: text("contest_id")
			.notNull()
			.references(() => contest.id),
		index: integer("index").notNull(),
		title: varchar("title", { length: 32 }).notNull(),
		description: text("description").notNull(),
	},
	(t) => [check("valid_index", sql`${t.index} > 0`)],
);

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
	problemId: text("problem_id")
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
	problemId: text("problem_id")
		.notNull()
		.references(() => problem.id),
	input: text("input").notNull(),
	language: varchar("language", { length: 16 }).notNull(),
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
export const result = operatorSchema.table(
	"result",
	{
		testcaseId: uuid("testcase_id").references(() => testcase.id),
		submissionId: uuid("submission_id").references(() => submission.id),
		status: integer("status").notNull(),
		message: varchar("message", { length: 256 }).notNull(),
	},
	(t) => [primaryKey({ columns: [t.testcaseId, t.submissionId] })],
);

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
