import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as table from "@/db/schema";
import { LocalboxResultSchema } from "./schema";

const worker = new Worker(new URL("./worker.ts", import.meta.url));

worker.onmessage = async (event) => {
	const data = Value.Parse(
		Type.Object({
			id: Type.String(),
			testcase: Type.Number(),
			result: LocalboxResultSchema,
		}),
		event.data,
	);

	await db.insert(table.result).values({
		submissionId: data.id,
		testcaseNumber: data.testcase,
		status: "accepted",
		message: data.result.message,
	});
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

		await db.insert(table.submission).values({
			userId: user,
			contestId: contest,
			problemNumber: problem,
			code,
			language: engine,
		});

		for (const testcase of testcases) {
			worker.postMessage({
				user,
				id: [contest, problem, testcase.number],
				engine,
				files: [{ content: code, name: "@" }],
				options: {
					stdin: testcase.input,
				},
			});
		}
	}
}
