import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgSchema,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const operatorSchema = pgSchema("operator");

export const contest = operatorSchema.table("contest", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	startTime: timestamp("start_time").notNull(),
	endTime: timestamp("end_time").notNull(),
});

export const contestRelations = relations(contest, ({ many }) => ({
	problems: many(problem),
}));

export const problem = operatorSchema.table("problem", {
	id: uuid("id").primaryKey().defaultRandom(),
	contestId: integer("contest_id").notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
});

export const problemRelations = relations(problem, ({ one, many }) => ({
	contest: one(contest, {
		fields: [problem.contestId],
		references: [contest.id],
	}),
	testcases: many(testcase),
}));

export const testcase = operatorSchema.table("testcase", {
	id: uuid("id").primaryKey().defaultRandom(),
	problemId: integer("problem_id").notNull(),
	input: text("input").notNull(),
	output: text("output").notNull(),
	hidden: boolean("hidden").default(false).notNull(),
});

export const testcaseRelations = relations(testcase, ({ one }) => ({
	problem: one(problem, {
		fields: [testcase.problemId],
		references: [problem.id],
	}),
}));
