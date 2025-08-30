import { Value } from "@sinclair/typebox/value";
import { and, eq } from "drizzle-orm";
import { t } from "elysia";
import { db } from "@/db";
import * as table from "@/db/schema";
import { PistonResultSchema } from "./client";

const PistonWorker = new Worker(new URL("worker.ts", import.meta.url).href);

PistonWorker.addEventListener("message", async (event) => {
	const data = Value.Parse(
		t.Object({
			submission: t.String(),
			testcase: t.Number(),
			output: PistonResultSchema,
		}),
		event.data,
	);

	await db.insert(table.result).values({
		submissionId: data.submission,
		testcaseNumber: data.testcase,
		status: "accepted",
		message: data.output.run.output,
	});
});

export namespace PistonService {
	export async function submit(
		userId: string,
		contestId: string,
		problemNumber: number,
		code: string,
		language: string,
	) {
		const [{ submission }] = await db
			.insert(table.submission)
			.values({
				userId,
				contestId,
				problemNumber,
				language,
				code,
			})
			.returning({ submission: table.submission.id });

		const testcases = await db.query.testcase.findMany({
			where: and(
				eq(table.testcase.contestId, contestId),
				eq(table.testcase.problemNumber, problemNumber),
			),
		});

		for (const testcase of testcases) {
			PistonWorker.postMessage({
				submission,
				testcase: testcase.number,
				language,
				code,
				stdin: testcase.input,
			});
		}

		return submission;
	}
}
