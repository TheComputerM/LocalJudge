import { t } from "elysia";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "@/api/models";
import { contest } from "@/db/schema";

export const contestSettingsSchema = t.Object({
	leaderboard: t.Boolean({
		default: true,
		title: "Leaderboard",
		description:
			"Allows the participants to view the leaderboard for the contest if true.",
	}),
	submissions_limit: t.Number({
		default: 0,
		title: "Submission Limit",
		description:
			"The maximum number of submissions allowed per question by a participant. A value of 0 means unlimited submissions.",
	}),
	visible_results: t.Boolean({
		default: true,
		title: "Visible Results",
		description:
			"Allows participants to view the results of their own submissions if true.",
	}),
	languages: t.Array(t.String(), {
		default: [],
		title: "Languages whitelist",
		description: "List of programming languages supported in the contest.",
		minItems: 1,
	}),
});

const name = t.String({ minLength: 4, maxLength: 48 });

const _selectSchema = createSelectSchema(contest, {
	name,
	settings: contestSettingsSchema,
});
const _insertSchema = createInsertSchema(contest, {
	name,
	settings: contestSettingsSchema,
});
const _updateSchema = createUpdateSchema(contest, {
	name: t.Optional(name),
	settings: t.Optional(contestSettingsSchema),
});

export namespace ContestModel {
	export const select = _selectSchema;
	export const insert = t.Omit(_insertSchema, ["id"]);
	export const update = t.Omit(_updateSchema, ["id"]);

	export const settings = contestSettingsSchema;
}
