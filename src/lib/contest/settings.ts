import * as z from "zod/v4";

export const contestSettingsSchema = z
	.object({
		leaderboard: z.boolean().default(true).meta({
			title: "Leaderboard",
			description:
				"Allows the participants to view the leaderboard for the contest if true.",
		}),
		submissions: z
			.object({
				limit: z.number().default(-1).meta({
					title: "Submission Limit",
					description:
						"The maximum number of submissions allowed per question by a participant. A value of -1 means unlimited submissions.",
				}),
				visible: z.boolean().default(true).meta({
					title: "Submission Visibility",
					description:
						"Allows participants to view the results of their own submissions if true.",
				}),
			})
			.prefault({}),
	})
	.prefault({});

export type ContestSettings = z.infer<typeof contestSettingsSchema>;
