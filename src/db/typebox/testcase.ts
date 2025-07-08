import { t } from "elysia";
import { testcase } from "../schema";
import { createInsertSchema } from ".";

const _insertSchema = createInsertSchema(testcase, {
	hidden: t.Boolean({ default: false }),
});

export namespace TestcaseModel {
	export const insert = t.Omit(_insertSchema, [
		"contestId",
		"problemNumber",
		"number",
	]);
}
