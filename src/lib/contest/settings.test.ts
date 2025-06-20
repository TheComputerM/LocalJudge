import { expect, test } from "bun:test";
import { contestSettingsSchema } from "./settings";

test("default contest settings", () => {
	const defaultConfig = {
		leaderboard: true,
		submissions: {
			limit: -1,
			visible: true,
		},
	};

	expect(contestSettingsSchema.parse(undefined)).toStrictEqual(defaultConfig);
	expect(contestSettingsSchema.parse({})).toStrictEqual(defaultConfig);
});

test("propagate settings", () => {
	const defaultConfig = contestSettingsSchema.parse(undefined);

	expect(
		contestSettingsSchema.parse({
			leaderboard: false,
		}),
	).toStrictEqual({
		...defaultConfig,
		leaderboard: false,
	});

	expect(
		contestSettingsSchema.parse({
			submissions: {
				limit: 10,
			},
		}),
	).toStrictEqual({
		...defaultConfig,
		submissions: {
			...defaultConfig.submissions,
			limit: 10,
		},
	});
});
