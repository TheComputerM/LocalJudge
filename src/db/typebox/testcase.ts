import { t } from "elysia";
import { testcase } from "../schema";
import { createInsertSchema, createSelectSchema } from ".";

const _insertSchema = createInsertSchema(testcase, {
	hidden: t.Boolean({ default: false }),
});

const _selectSchema = createSelectSchema(testcase);

export namespace TestcaseModel {
	export const insert = t.Omit(_insertSchema, [
		"contestId",
		"problemNumber",
		"number",
	]);
	export const select = t.Omit(_selectSchema, ["contestId", "problemNumber"]);
}
