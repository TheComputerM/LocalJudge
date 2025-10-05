import { taskRunnerDB as db } from "scripts/db/utils";
import * as table from "@/db/schema";
import { auth } from "@/lib/auth";

console.info("Creating test user...");
const { user } = await auth.api.createUser({
	body: {
		name: "Test User",
		email: "testuser@localjudge.com",
		password: "pass123",
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
			languages: ["cpp", "python"],
		},
	})
	.returning({ id: table.contest.id });

await db.insert(table.registration).values({
	userId: user.id,
	contestId,
});

console.info("Creating problems...");
for (let i = 1; i <= 3; i++) {
	await db.insert(table.problem).values({
		contestId,
		number: i,
		title: `Test Problem ${i}`,
		description: `very **cool** description for problem ${i}`,
	});
}

console.info("Creating testcases...");
const problems = await db
	.select({ contestId: table.problem.contestId, number: table.problem.number })
	.from(table.problem);
for (const problem of problems) {
	for (let i = 1; i <= 3; i++) {
		const stdin = `hello world ${i}`;
		await db.insert(table.testcase).values({
			contestId: problem.contestId,
			problemNumber: problem.number,
			number: i,
			hidden: false,
			input: stdin,
			output: stdin, // For simplicity, input is the same as output
		});
	}
}
