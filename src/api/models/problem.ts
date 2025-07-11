import { t } from "elysia";
import { problem } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from ".";

const _insertSchema = createInsertSchema(problem);
const _selectSchema = createSelectSchema(problem);

export namespace ProblemModel {
	export const select = t.Omit(_selectSchema, ["contestId"]);
	export const listSelect = t.Array(t.Omit(select, ["description"]));
	export const insert = t.Omit(_insertSchema, ["contestId", "number"]);
}
