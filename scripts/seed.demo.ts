import { db } from "@/db";
import * as table from "@/db/schema";
import { auth } from "@/lib/auth";

console.info("Creating test user...");
const { user } = await auth.api.createUser({
	body: {
		name: "Test User",
		email: "testuser@localjudge.com",
		password: "testpassword",
		role: "user",
	},
});

console.info("Creating contest...");
const [{ id: contestId }] = await db
	.insert(table.contest)
	.values({
		name: "Test Contest",
		startTime: new Date(),
		endTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
		settings: {
			leaderboard: true,
			submissions: {
				limit: 0,
				visible: true,
			},
		},
	})
	.returning({ id: table.contest.id });
await db.insert(table.userToContest).values({
	userId: user.id,
	contestId,
});

console.info("Creating problems...");
for (let i = 1; i <= 3; i++) {
	await db.insert(table.problem).values({
		title: `Test Problem ${i}`,
		description: `very **cool** description for problem ${i}`,
		contestId,
	});
}
