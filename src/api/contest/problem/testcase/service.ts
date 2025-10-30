import { and, asc, eq, gt, SQL, sql } from "drizzle-orm";
import { TestcaseModel } from "@/api/contest/problem/testcase/model";
import { db } from "@/db";
import * as table from "@/db/schema";

export namespace TestcaseService {
	export async function isExists(
		contestId: string,
		problemNumber: number,
		testcaseNumber: number,
	) {
		const count = await db.$count(
			table.testcase,
			and(
				eq(table.testcase.contestId, contestId),
				eq(table.testcase.problemNumber, problemNumber),
				eq(table.testcase.number, testcaseNumber),
			),
		);
		return count > 0;
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
				number: false,
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
	export async function truncate(contestId: string, problemNumber: number) {
		await db
			.delete(table.testcase)
			.where(
				and(
					eq(table.testcase.contestId, contestId),
					eq(table.testcase.problemNumber, problemNumber),
				),
			);
	}

	export async function create(
		contestId: string,
		problemNumber: number,
		testcase: typeof TestcaseModel.insert.static,
	) {
		const count = db.$count(
			table.testcase,
			and(
				eq(table.testcase.contestId, contestId),
				eq(table.testcase.problemNumber, problemNumber),
			),
		);
		const [data] = await db
			.insert(table.testcase)
			.values({
				...testcase,
				contestId,
				problemNumber,
				number: sql`${count} + 1`,
			})
			.returning();
		return data;
	}

	export async function upsert(
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

	export async function remove(
		contestId: string,
		problemNumber: number,
		testcaseNumber: number,
	) {
		await db.transaction(async (txn) => {
			await txn
				.delete(table.testcase)
				.where(
					and(
						eq(table.testcase.contestId, contestId),
						eq(table.testcase.problemNumber, problemNumber),
						eq(table.testcase.number, testcaseNumber),
					),
				);
			await txn
				.update(table.testcase)
				.set({
					number: sql`${table.testcase.number} - 1`,
				})
				.where(
					and(
						eq(table.testcase.contestId, contestId),
						eq(table.testcase.problemNumber, problemNumber),
						gt(table.testcase.number, testcaseNumber),
					),
				);
		});
	}
}
