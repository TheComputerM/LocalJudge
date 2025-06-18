import { relations } from "drizzle-orm";
import {
	jsonb,
	pgSchema,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

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
}));

export const problem = operatorSchema.table("problem", {
	id: uuid("id").primaryKey().defaultRandom(),
	contestId: uuid("contest_id").notNull(),
	title: varchar("title", { length: 32 }).notNull(),
	description: text("description").notNull(),
});

export const problemRelations = relations(problem, ({ one, many }) => ({
	contest: one(contest, {
		fields: [problem.contestId],
		references: [contest.id],
	}),
	submissions: many(submission),
}));

export const submission = operatorSchema.table("submission", {
	id: uuid("id").primaryKey().defaultRandom(),
	problemId: uuid("problem_id").notNull(),
	input: text("input").notNull(),
	output: text("output").notNull(),
});

export const submissionRelations = relations(submission, ({ one }) => ({
	problem: one(problem, {
		fields: [submission.problemId],
		references: [problem.id],
	}),
}));
