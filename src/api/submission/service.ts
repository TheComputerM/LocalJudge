import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import * as table from "@/db/schema";
import { SubmissionModel } from "./model";

export namespace SubmissionService {
	/** SQL for getting number of total and passed test cases for the submission */

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
				results: {
					columns: {
						submissionId: false,
					},
					orderBy: asc(table.result.testcaseNumber),
				},
			},
		});
		return submission;
	}

	/** Get submissions with optional filters */
	export async function getSubmissions(
		options: Partial<{
			contest: string;
			problem: number;
			user: string;
		}>,
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
			},
			orderBy: desc(table.submission.createdAt),
			extras: {
				// TODO: fix table.result incorrect sql name
				results: sql<{ total: number; passed: number }>`
		(SELECT row_to_json(t) 
		FROM (
			SELECT 
				COUNT(*) AS total, 
				COUNT(*) FILTER (WHERE ${table.result}."status" = 'CA') AS passed 
			FROM ${table.result} 
			WHERE ${table.result}."submission_id" = ${table.submission.id}
		) t)`.as("results"),
			},
		});

		return submissions;
	}
}
