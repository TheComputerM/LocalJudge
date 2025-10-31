import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import * as table from "@/db/schema";
import { SubmissionModel } from "./model";

export namespace SubmissionService {
	export async function getSubmission(id: string) {
		const submission = await db.query.submission.findFirst({
			where: eq(table.submission.id, id),
			with: {
				user: {
					columns: {
						name: true,
					},
				},
				problem: {
					columns: {
						title: true,
					},
				},
				contest: {
					columns: {
						name: true,
					},
				},
			},
		});
		return submission;
	}

	export async function isExists(id: string): Promise<boolean> {
		const count = await db.$count(
			table.submission,
			eq(table.submission.id, id),
		);
		return count > 0;
	}

	export async function getStatus(id: string) {
		const [{ value }] = await db.execute<
			//@ts-ignore: Type inference issue with drizzle-orm
			Record<string, { total: number; passed: number }>[]
		>(
			sql`
		SELECT row_to_json(t) as value
		FROM (
			SELECT
				COUNT(*) AS total,
				COUNT(*) FILTER (WHERE ${table.result.status} = 'CA') AS passed
			FROM ${table.result}
			WHERE ${table.result.submissionId} = ${id}
		) t`,
		);
		const submission = await db.query.submission.findFirst({
			columns: {
				contestId: true,
				problemNumber: true,
			},
			where: eq(table.submission.id, id),
		});
		if (!submission) {
			throw new Error("Submission not found");
		}

		const totalTestcases = await db.$count(
			table.testcase,
			and(
				eq(table.testcase.contestId, submission.contestId),
				eq(table.testcase.problemNumber, submission.problemNumber),
			),
		);

		const output: typeof SubmissionModel.status.static = {
			...value,
			state:
				value.total < totalTestcases
					? value.total === 0
						? "pending"
						: "processing"
					: "done",
		};

		return output;
	}

	export async function getResults(id: string) {
		const results = await db.query.result.findMany({
			where: eq(table.result.submissionId, id),
			orderBy: asc(table.result.testcaseNumber),
		});
		return results;
	}

	/** Get submissions with optional filters */
	export async function getSubmissions(
		options: Partial<{
			contest: string;
			problem: number;
			user: string;
		}>,
		limit?: number,
		offset?: number,
	): Promise<typeof SubmissionModel.groupSelect.static> {
		const submissions = await db.query.submission.findMany({
			columns: {
				content: false,
			},
			where: and(
				...[
					options.contest && eq(table.submission.contestId, options.contest),
					options.problem &&
						eq(table.submission.problemNumber, options.problem),
					options.user && eq(table.submission.userId, options.user),
				].filter((x) => !!x),
			),
			with: {
				user: {
					columns: {
						name: true,
					},
				},
				problem: {
					columns: {
						title: true,
					},
				},
				contest: {
					columns: {
						name: true,
					},
				},
			},
			orderBy: desc(table.submission.createdAt),
			limit,
			offset,
		});

		return submissions;
	}
}
