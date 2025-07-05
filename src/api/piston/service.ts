import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import * as table from "@/db/schema";

const PistonWorker = new Worker(new URL("worker.ts", import.meta.url).href);

PistonWorker.addEventListener("message", (event) => {
	console.log(event.data);
});

export namespace PistonService {
	export async function submit(
		userId: string,
		contestId: string,
		problem: number,
	) {
		const code = `print(input())`;
		const language = "python@3.12.0";

		const [{ submission }] = await db
			.insert(table.submission)
			.values({
				userId,
				contestId,
				problemNumber: problem,
				language,
				code,
			})
			.returning({ submission: table.submission.id });

		const testcases = await db
			.select()
			.from(table.testcase)
			.where(
				and(
					eq(table.testcase.contestId, contestId),
					eq(table.testcase.problemNumber, problem),
				),
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
