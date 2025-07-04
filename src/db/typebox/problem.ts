import { t } from "elysia";
import { problem } from "../schema";
import { createInsertSchema } from ".";

const _insertSchema = createInsertSchema(problem);

export namespace ProblemModel {
	export const insert = t.Omit(_insertSchema, ["contestId", "number"]);
}
