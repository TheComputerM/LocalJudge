import { and, eq, sql } from "drizzle-orm";
import { ContestModel } from "@/api/models/contest";
import { ProblemModel } from "@/api/models/problem";
import { TestcaseModel } from "@/api/models/testcase";
import { db } from "@/db";
import * as table from "@/db/schema";

export namespace AdminService {
	export async function getOverview() {
		const _stats = await Promise.all([
			db.$count(table.contest),
			db.$count(table.user, eq(table.user.role, "user")),
			db.$count(table.submission),
		]);

		return {
			statistics: {
				contests: _stats[0],
				participants: _stats[1],
				submissions: _stats[2],
			},
		};
	}

	export async function createContest(
		contest: typeof ContestModel.insert.static,
	) {
		return db.insert(table.contest).values(contest).returning();
	}

	export async function updateContest(
		id: string,
		contest: typeof ContestModel.insert.static,
	) {
		await db.update(table.contest).set(contest).where(eq(table.contest.id, id));
	}

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
		problem: typeof ProblemModel.insert.static,
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

	export async function upsertTestcases(
		contestId: string,
		problemNumber: number,
		testcases: (typeof TestcaseModel.upsert.static)[],
	) {
		const updateColumns = Object.fromEntries(
			Object.keys(TestcaseModel.update.properties).map((v) => [
				v,
				sql`excluded.${v}`,
			]),
		);
		return db
			.insert(table.testcase)
			.values(
				testcases.map((tc) => ({
					contestId,
					problemNumber,
					...tc,
				})),
			)
			.onConflictDoUpdate({
				target: [
					table.testcase.contestId,
					table.testcase.problemNumber,
					table.testcase.number,
				],
				set: updateColumns,
			})
			.returning();
	}
}
