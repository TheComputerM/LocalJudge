import { and, asc, eq, SQL, sql } from "drizzle-orm";
import { TestcaseModel } from "@/api/contest/problem/testcase/model";
import { db } from "@/db";
import * as table from "@/db/schema";

export namespace TestcaseService {
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
}

export namespace TestcaseAdminService {
	export async function upsertTestcases(
		contestId: string,
		problemNumber: number,
		testcases: (typeof TestcaseModel.upsert.static)[],
	) {
		const updateColumns = Object.keys(TestcaseModel.update.properties).reduce(
			(acc, v) => {
				acc[v] = sql.raw(`EXCLUDED.${v}`);
				return acc;
			},
			{} as Record<string, SQL>,
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
