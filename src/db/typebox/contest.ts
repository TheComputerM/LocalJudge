import { Type } from "@sinclair/typebox";
import { createInsertSchema } from "drizzle-typebox";
import { contest } from "../schema";

export const contestSettingsSchema = Type.Object(
	{
		leaderboard: Type.Boolean({
			default: true,
			title: "Leaderboard",
			description:
				"Allows the participants to view the leaderboard for the contest if true.",
		}),
		submissions: Type.Object(
			{
				limit: Type.Number({
					default: 0,
					title: "Submission Limit",
					description:
						"The maximum number of submissions allowed per question by a participant. A value of 0 means unlimited submissions.",
				}),
				visible: Type.Boolean({
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

export const contestInsertSchema = createInsertSchema(contest, {
	name: Type.String({ minLength: 1, maxLength: 32, default: "" }),
	settings: contestSettingsSchema,
});
