import { t } from "elysia";
import { contest } from "../schema";
import { createInsertSchema } from ".";

export const contestSettingsSchema = t.Object(
	{
		leaderboard: t.Boolean({
			default: true,
			title: "Leaderboard",
			description:
				"Allows the participants to view the leaderboard for the contest if true.",
		}),
		submissions: t.Object(
			{
				limit: t.Number({
					default: 0,
					title: "Submission Limit",
					description:
						"The maximum number of submissions allowed per question by a participant. A value of 0 means unlimited submissions.",
				}),
				visible: t.Boolean({
					default: true,
					title: "Submission Visibility",
					description:
						"Allows participants to view the results of their own submissions if true.",
				}),
			},
			{ default: {} },
		),
	},
	{ default: {} },
);

const _contestInsert = createInsertSchema(contest, {
	name: t.String({ minLength: 4, maxLength: 32, default: "" }),
	settings: contestSettingsSchema,
});

export const contestSchema = {
	insert: t.Omit(_contestInsert, ["id"]),
};
