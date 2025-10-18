import { relations, type SQL, sql } from "drizzle-orm";
import {
	boolean,
	check,
	foreignKey,
	integer,
	jsonb,
	pgSchema,
	primaryKey,
	smallint,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import type { contestSettingsSchema } from "@/api/contest/model";
import { user } from "./auth";

export const operatorSchema = pgSchema("operator");

export const contest = operatorSchema.table(
	"contest",
	{
		id: text("id")
			.$default(() => nanoid(12))
			.primaryKey(),
		name: varchar("name", { length: 48 }).notNull(),
		startTime: timestamp("start_time", { withTimezone: true }).notNull(),
		endTime: timestamp("end_time", { withTimezone: true }).notNull(),
		settings: jsonb("settings")
			.$type<typeof contestSettingsSchema.static>()
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
			.references(() => user.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		contestId: text("contest_id")
			.notNull()
			.references(() => contest.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
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
		contestId: text("contest_id")
			.notNull()
			.references(() => contest.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		number: smallint("number").notNull(),
		title: varchar("title", { length: 32 }).notNull(),
		description: text("description").notNull(),
		timeLimit: integer("time_limit").notNull().default(1000),
		memoryLimit: integer("memory_limit").notNull().default(256),
	},
	(t) => [
		check("valid_number", sql`${t.number} > 0`),
		primaryKey({ columns: [t.contestId, t.number] }),
	],
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
export const testcase = operatorSchema.table(
	"testcase",
	{
		contestId: text("contest_id").notNull(),
		problemNumber: smallint("problem_number").notNull(),
		number: smallint("number").notNull(),
		hidden: boolean("hidden").notNull().default(false),
		input: text("input").notNull(),
		output: text("output").notNull(),
	},
	(t) => [
		check("valid_number", sql`${t.number} > 0`),
		primaryKey({ columns: [t.contestId, t.problemNumber, t.number] }),
		foreignKey({
			columns: [t.contestId, t.problemNumber],
			foreignColumns: [problem.contestId, problem.number],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	],
);

export const testcaseRelations = relations(testcase, ({ one, many }) => ({
	problem: one(problem, {
		fields: [testcase.contestId, testcase.problemNumber],
		references: [problem.contestId, problem.number],
	}),
}));

/**
 * Represents a submission made by a user for a problem in a contest.
 */
export const submission = operatorSchema.table(
	"submission",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		contestId: text("contest_id").notNull(),
		problemNumber: smallint("problem_number").notNull(),
		content: jsonb("content").$type<Record<string, string>>().notNull(),
		language: varchar("language", { length: 24 }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [
		foreignKey({
			columns: [t.contestId, t.problemNumber],
			foreignColumns: [problem.contestId, problem.number],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	],
);

export const submissionRelations = relations(submission, ({ one, many }) => ({
	problem: one(problem, {
		fields: [submission.contestId, submission.problemNumber],
		references: [problem.contestId, problem.number],
	}),
	user: one(user, {
		fields: [submission.userId],
		references: [user.id],
	}),
	results: many(result),
}));

export const statusEnum = operatorSchema.enum("status", [
	"CA",
	"WA",
	"RE",
	"CE",
	"XX",
]);

/**
 * Represents the result of a submission for a specific test case.
 */
export const result = operatorSchema.table(
	"result",
	{
		submissionId: uuid("submission_id")
			.notNull()
			.references(() => submission.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		testcaseNumber: smallint("testcase_number").notNull(),
		status: statusEnum("status").notNull(),
		time: integer("time").notNull(),
		memory: integer("memory").notNull(),
		stdout: text("stdout").notNull(),
		message: text("message").notNull(),
	},
	(t) => [
		primaryKey({
			columns: [t.submissionId, t.testcaseNumber],
		}),
	],
);

export const resultRelations = relations(result, ({ one }) => ({
	submission: one(submission, {
		fields: [result.submissionId],
		references: [submission.id],
	}),
}));
