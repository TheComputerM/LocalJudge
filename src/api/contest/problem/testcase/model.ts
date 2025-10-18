import { t } from "elysia";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "@/api/models";
import { testcase } from "@/db/schema";

const _selectSchema = createSelectSchema(testcase);
const _insertSchema = createInsertSchema(testcase);
const _updateSchema = createUpdateSchema(testcase);

export namespace TestcaseModel {
	export const select = t.Omit(_selectSchema, ["contestId", "problemNumber"]);
	export const groupSelect = t.Array(t.Omit(select, ["input", "output"]));

	export const upsert = t.Omit(_insertSchema, ["contestId", "problemNumber"]);
	export const insert = t.Omit(upsert, ["number"]);
	export const update = t.Omit(_updateSchema, [
		"contestId",
		"problemNumber",
		"number",
	]);
}
