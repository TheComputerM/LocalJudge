import { t } from "elysia";
import { ProblemModel } from "@/api/contest/problem/model";
import { createSelectSchema } from "@/api/models";
import { result, submission } from "@/db/schema";
import { ContestModel } from "../contest/model";

const additional = {
	user: t.Object({
		name: t.String(),
	}),
	problem: t.Pick(ProblemModel.select, ["title"]),
	contest: t.Pick(ContestModel.select, ["name"]),
};

const _resultSelect = createSelectSchema(result);

const _select = createSelectSchema(submission);

export namespace SubmissionModel {
	export const select = t.Intersect([_select, t.Object(additional)]);

	export const groupSelect = t.Array(
		t.Intersect([t.Omit(_select, ["content"]), t.Object(additional)]),
	);

	export const status = t.Object({
		total: t.Number(),
		passed: t.Number(),
	});

	export namespace Result {
		export const select = _resultSelect;
	}
}
