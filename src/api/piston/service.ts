import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { db } from "@/db";
import * as table from "@/db/schema";
import { ProblemService } from "../contest/service";
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
		status: data.output.run.code ?? 0,
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

		const testcases = await ProblemService.getTestcases(
			contestId,
			problemNumber,
			{ includeHidden: true },
		);

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
