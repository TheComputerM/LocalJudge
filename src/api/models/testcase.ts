import { t } from "elysia";
import { testcase } from "@/db/schema";
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

	export namespace Group {
		export const insert = t.Array(
			t.Omit(_insertSchema, ["contestId", "problemNumber"]),
		);
	}
}
