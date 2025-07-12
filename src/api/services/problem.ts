import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as table from "@/db/schema";

export namespace ProblemService {
	/** Get all problems in a contest */
	export async function getProblems(contestId: string) {
		return db.query.problem.findMany({
			where: eq(table.problem.contestId, contestId),
			columns: {
				contestId: false,
				description: false,
			},
			orderBy: asc(table.problem.number),
		});
	}

	/** Get a specific problem in a contest by its number */
	export async function getProblem(contestId: string, problemNumber: number) {
		return db.query.problem.findFirst({
			columns: {
				contestId: false,
			},
			where: and(
				eq(table.problem.contestId, contestId),
				eq(table.problem.number, problemNumber),
			),
		});
	}

	/** Get all test cases for a specific problem in a contest */
	export async function getTestcases(contestId: string, problemNumber: number) {
		return db.query.testcase.findMany({
			columns: {
				contestId: false,
				problemNumber: false,
				input: false,
				output: false,
			},
			where: and(
				eq(table.testcase.contestId, contestId),
				eq(table.testcase.problemNumber, problemNumber),
			),
			orderBy: asc(table.testcase.number),
		});
	}

	export async function getTestcase(
		contestId: string,
		problemNumber: number,
		testcaseNumber: number,
	) {
		return db.query.testcase.findFirst({
			columns: {
				contestId: false,
				problemNumber: false,
			},
			where: and(
				eq(table.testcase.contestId, contestId),
				eq(table.testcase.problemNumber, problemNumber),
				eq(table.testcase.number, testcaseNumber),
			),
		});
	}

	/** Get all submissions for a specific problem in a contest */
	export async function getSubmissionsByUser(
		userId: string,
		contestId: string,
		problemNumber: number,
	) {
		return db.query.submission.findMany({
			columns: {
				userId: false,
				contestId: false,
				problemNumber: false,
				code: false,
			},
			with: {
				problem: {
					columns: {
						title: true,
					},
				},
			},
			where: and(
				eq(table.submission.userId, userId),
				eq(table.submission.contestId, contestId),
				eq(table.submission.problemNumber, problemNumber),
			),
		});
	}
}
