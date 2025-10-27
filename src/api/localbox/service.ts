import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as table from "@/db/schema";
import { LocalboxSchema } from "./schema";
import { submissionWatcher } from "./watcher";

const worker = new Worker(new URL("./worker.ts", import.meta.url));

const tokenize = (content: string) => content.trim().split(/\s+/g);

function checker(a: string, b: string): boolean {
	const atokens = tokenize(a);
	const btokens = tokenize(b);
	if (atokens.length !== btokens.length) return false;
	for (let i = 0; i < atokens.length; i++) {
		if (atokens[i] !== btokens[i]) return false;
	}
	return true;
}

async function getExpectedOutput(submissionId: string, testcaseNumber: number) {
	const submission = await db.query.submission.findFirst({
		columns: {
			contestId: true,
			problemNumber: true,
		},
		where: eq(table.submission.id, submissionId),
	});

	if (!submission) {
		throw new Error("Submission not found");
	}

	const testcase = await db.query.testcase.findFirst({
		columns: {
			output: true,
		},
		where: and(
			eq(table.testcase.contestId, submission.contestId),
			eq(table.testcase.problemNumber, submission.problemNumber),
			eq(table.testcase.number, testcaseNumber),
		),
	});

	if (!testcase) {
		throw new Error("Testcase not found");
	}

	return testcase.output;
}

worker.onmessage = async (event) => {
	const { id, testcase, result } = Value.Parse(
		Type.Object({
			id: Type.String(),
			testcase: Type.Number(),
			result: LocalboxSchema.Result,
		}),
		event.data,
	);

	const record = {
		submissionId: id,
		testcaseNumber: testcase,
		status: "XX" as (typeof table.statusEnum.enumValues)[number],
		stdout: result.stdout,
		time: result.time,
		memory: result.memory,
		message: result.message,
	};

	switch (result.status) {
		case "OK":
			const expectedOutput = await getExpectedOutput(id, testcase);
			const accepted = checker(result.stdout, expectedOutput);
			record.status = accepted ? "CA" : "WA";
			record.message = accepted ? "Correct Answer" : "Wrong Answer";
			break;
		case "CE":
			record.status = "CE";
			break;
		case "RE":
			record.status = "RE";
			break;
	}

	await db.insert(table.result).values(record);
	submissionWatcher.trigger({ id, testcase, status: record.status });
};

export namespace LocalboxService {
	export async function submit(
		user: string,
		contest: string,
		problem: number,
		engine: string,
		code: string,
	) {
		const testcases = await db.query.testcase.findMany({
			where: and(
				eq(table.testcase.contestId, contest),
				eq(table.testcase.problemNumber, problem),
			),
			orderBy: asc(table.testcase.number),
		});

		const [{ id }] = await db
			.insert(table.submission)
			.values({
				userId: user,
				contestId: contest,
				problemNumber: problem,
				content: code,
				language: engine,
			})
			.returning({ id: table.submission.id });

		for (const testcase of testcases) {
			worker.postMessage({
				id,
				testcase: testcase.number,
				engine,
				files: [{ content: code, name: "@" }],
				options: {
					stdin: testcase.input,
				},
			});
		}

		return id;
	}

	export const watcher = submissionWatcher;
}
