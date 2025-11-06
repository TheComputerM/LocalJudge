import { and, asc, eq, gt, sql } from "drizzle-orm";
import { get } from "es-toolkit/compat";
import { db } from "@/db";
import * as table from "@/db/schema";
import boilerplateYAML from "./boilerplate.yaml?raw";
import { ProblemModel } from "./model";

const boilerplate = Bun.YAML.parse(boilerplateYAML) as Record<string, string>;

export namespace ProblemService {
	export async function isExists(contestId: string, problemNumber: number) {
		const count = await db.$count(
			table.problem,
			and(
				eq(table.problem.contestId, contestId),
				eq(table.problem.number, problemNumber),
			),
		);
		return count > 0;
	}

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

	export async function getSnapshot(
		userId: string,
		contestId: string,
		problemNumber: number,
		language: string,
	) {
		const latest = await db.query.snapshot.findFirst({
			columns: {
				content: true,
			},
			where: and(
				eq(table.snapshot.contestId, contestId),
				eq(table.snapshot.userId, userId),
			),
		});
		return get(
			latest,
			["content", language, problemNumber],
			boilerplate[language] ?? "",
		);
	}
}

export namespace ProblemAdminService {
	export async function create(
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

	export async function update(
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

	export async function remove(contestId: string, problemNumber: number) {
		await db.transaction(async (txn) => {
			await txn
				.delete(table.problem)
				.where(
					and(
						eq(table.problem.contestId, contestId),
						eq(table.problem.number, problemNumber),
					),
				);
			await txn
				.update(table.problem)
				.set({ number: sql`${table.problem.number} - 1` })
				.where(
					and(
						eq(table.problem.contestId, contestId),
						gt(table.problem.number, problemNumber),
					),
				);
		});
	}
}
