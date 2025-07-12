import { t } from "elysia";
import { testcase } from "@/db/schema";
import { createInsertSchema, createUpdateSchema } from ".";

const _insertSchema = createInsertSchema(testcase);
const _updateSchema = createUpdateSchema(testcase);

export namespace TestcaseModel {
	export const upsert = t.Omit(_insertSchema, ["contestId", "problemNumber"]);
	export const insert = t.Omit(upsert, ["number"]);
	export const update = t.Omit(_updateSchema, [
		"contestId",
		"problemNumber",
		"number",
	]);
}
