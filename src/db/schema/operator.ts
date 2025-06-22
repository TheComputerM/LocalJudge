import { relations } from "drizzle-orm";
import {
	jsonb,
	pgSchema,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { userToContest } from "./junction";

export const operatorSchema = pgSchema("operator");

export const contest = operatorSchema.table("contest", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: varchar("name", { length: 32 }).notNull(),
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time").notNull(),
	settings: jsonb("settings"),
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

export const testcase = operatorSchema.table("testcase", {
	id: uuid("id").primaryKey().defaultRandom(),
	problemId: uuid("problem_id")
		.notNull()
		.references(() => problem.id),
	answer: text("answer").notNull(),
});

export const testcaseRelations = relations(testcase, ({ one }) => ({
	problem: one(problem, {
		fields: [testcase.problemId],
		references: [problem.id],
	}),
}));

export const submission = operatorSchema.table("submission", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	problemId: uuid("problem_id")
		.notNull()
		.references(() => problem.id),
	code: text("input").notNull(),
});

export const submissionRelations = relations(submission, ({ one }) => ({
	problem: one(problem, {
		fields: [submission.problemId],
		references: [problem.id],
	}),
	user: one(user, {
		fields: [submission.userId],
		references: [user.id],
	}),
}));
