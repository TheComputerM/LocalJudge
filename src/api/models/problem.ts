import { t } from "elysia";
import { problem } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from ".";

const timeLimit = t.Number({
	title: "Time Limit",
	description: "Time limit for execution for each testcase (in milliseconds)",
	default: 1000,
});

const memoryLimit = t.Number({
	title: "Memory Limit",
	description: "Memory limit for execution for each testcase (in MB)",
	default: 256,
});

const _insertSchema = createInsertSchema(problem, {
	timeLimit: t.Optional(timeLimit),
	memoryLimit: t.Optional(memoryLimit),
});
const _selectSchema = createSelectSchema(problem, {
	timeLimit,
	memoryLimit,
});

export namespace ProblemModel {
	export const select = t.Omit(_selectSchema, ["contestId"]);
	export const groupSelect = t.Array(t.Omit(select, ["description"]));
	export const insert = t.Omit(_insertSchema, ["contestId", "number"]);
}
