import { faker } from "@faker-js/faker";
import { Static } from "@sinclair/typemap";
import { taskRunnerDB as db } from "scripts/utils";
import { ContestModel } from "@/api/models/contest";
import { $piston } from "@/api/piston/client";
import * as table from "@/db/schema";
import { auth } from "@/lib/auth";
import { rejectError } from "@/lib/utils";

const CONFIG = {
	count: {
		users: faker.number.int({ min: 20, max: 30 }),
		contests: faker.number.int({ min: 20, max: 30 }),
		problems: { min: 3, max: 6 },
		testcases: { min: 4, max: 8 },
	},
};

async function createUsers() {
	console.info("Creating users...");
	for (let i = 0; i < CONFIG.count.users; i++) {
		await auth.api.createUser({
			body: {
				name: faker.person.fullName(),
				email: faker.internet.email(),
				password: "pass123",
				role: "user",
			},
		});
	}
	console.info("Created users");
}

async function createContests() {
	console.info("Creating contests...");
	const data: Static<typeof ContestModel.insert>[] = new Array(
		CONFIG.count.contests,
	);
	const languages = (await rejectError($piston("@get/runtimes"))).map(
		({ language, version }) => `${language}@${version}`,
	);

	for (let i = 0; i < CONFIG.count.contests; i++) {
		const startTime = faker.date.between({
			from: faker.date.recent(),
			to: faker.date.soon(),
		});

		data[i] = {
			name: `${faker.hacker.adjective()} contest ${i + 1}`,
			startTime: startTime,
			endTime: faker.date.soon({ refDate: startTime }),
			settings: {
				leaderboard: faker.datatype.boolean(),
				submissions: {
					limit: faker.number.int({ min: 0, max: 8 }),
					visible: faker.datatype.boolean(),
				},
				languages: faker.helpers.arrayElements(languages, {
					min: 1,
					max: languages.length,
				}),
			},
		};
	}
	await db.insert(table.contest).values(data);
	console.info("Created contests");
}

async function createProblems() {
	console.info("Creating problems...");
	const contests = await db
		.select({ id: table.contest.id })
		.from(table.contest);

	for (const { id: contestId } of contests) {
		const count = faker.number.int(CONFIG.count.problems);
		for (let i = 1; i <= count; i++) {
			await db.insert(table.problem).values({
				contestId,
				number: i,
				title: `Problem ${i}`,
				description: faker.lorem.paragraphs(3),
			});
		}
	}

	console.info("Created problems");
}

async function createTestcases() {
	console.info("Creating testcases...");
	const problems = await db
		.select({
			contestId: table.problem.contestId,
			number: table.problem.number,
		})
		.from(table.problem);
	for (const problem of problems) {
		const count = faker.number.int(CONFIG.count.testcases);
		for (let i = 1; i <= count; i++) {
			const stdin = faker.word.noun();
			await db.insert(table.testcase).values({
				contestId: problem.contestId,
				problemNumber: problem.number,
				number: i,
				hidden: faker.datatype.boolean(),
				input: stdin,
				output: stdin,
			});
		}
	}
	console.info("Created testcases");
}

async function main() {
	await createUsers();
	await createContests();
	await createProblems();
	await createTestcases();
}

await main();
await db.$client.close();
