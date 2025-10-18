import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import * as table from "@/db/schema";
import { ProblemModel } from "./model";

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
				content: false,
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

export namespace ProblemAdminService {
	export async function createProblem(
		contestId: string,
		problem: typeof ProblemModel.insert.static,
	) {
		const [data] = await db
			.insert(table.problem)
			.values({
				...problem,
				contestId,
				number: sql`${db.$count(table.problem, eq(table.problem.contestId, contestId))} + 1`,
			})
			.returning();
		return data;
	}

	export async function updateProblem(
		contestId: string,
		problemNumber: number,
		problem: typeof ProblemModel.update.static,
	) {
		const [data] = await db
			.update(table.problem)
			.set(problem)
			.where(
				and(
					eq(table.problem.contestId, contestId),
					eq(table.problem.number, problemNumber),
				),
			)
			.returning();
		return data;
	}
}
