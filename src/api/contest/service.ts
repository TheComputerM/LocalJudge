import {
	and,
	countDistinct,
	desc,
	eq,
	getTableColumns,
	inArray,
	ne,
	notExists,
	sql,
} from "drizzle-orm";
import { db } from "@/db";
import * as table from "@/db/schema";
import { ContestModel } from "./model";

export namespace ContestService {
	/** Check if a user is registered for a contest */
	export async function isUserRegistered(contestId: string, userId: string) {
		const count = await db.$count(
			table.registration,
			and(
				eq(table.registration.userId, userId),
				eq(table.registration.contestId, contestId),
			),
		);
		return count > 0;
	}

	export async function isExists(contestId: string) {
		const count = await db.$count(
			table.contest,
			eq(table.contest.id, contestId),
		);
		return count > 0;
	}

	/** Register a user for a contest */
	export async function register(contestId: string, userId: string) {
		await db
			.insert(table.registration)
			.values({ userId: userId, contestId: contestId });
	}

	/** Get a contest by its ID */
	export async function getContest(contestId: string) {
		return db.query.contest.findFirst({
			where: eq(table.contest.id, contestId),
		});
	}

	/** Get all contests a user is registered for */
	export async function getContestsByUser(userId: string) {
		const registrations = await db.query.contest.findMany({
			where: inArray(
				table.contest.id,
				db
					.select({ data: table.registration.contestId })
					.from(table.registration)
					.where(eq(table.registration.userId, userId)),
			),
			orderBy: desc(table.contest.startTime),
		});

		return registrations;
	}

	export async function leaderboard(id: string) {
		const firstSubmissions = db
			.selectDistinctOn([table.submission.problemNumber], {
				id: table.submission.id,
				problemNumber: table.submission.problemNumber,
				createdAt: table.submission.createdAt,
			})
			.from(table.submission)
			.where(
				and(
					eq(table.submission.userId, sql.raw(`"user"."id"`)),
					eq(table.submission.contestId, id),
					notExists(
						db
							.select({ value: sql`1` })
							.from(table.result)
							.where(
								and(
									eq(table.result.submissionId, table.submission.id),
									ne(table.result.status, sql.raw(`'CA'`)),
								),
							),
					),
				),
			)
			.orderBy(table.submission.problemNumber, table.submission.createdAt)
			.as("first_submissions");

		const leaderboard = db
			.select({
				...getTableColumns(table.user),
				submissions: sql<
					{
						id: string;
						problem_number: number;
						created_at: Date;
					}[]
				>`${db.select({ value: sql`COALESCE(jsonb_agg("first_submissions"), '[]'::jsonb)` }).from(firstSubmissions)}`.as(
					"submissions",
				),
			})
			.from(table.user)
			.where(
				inArray(
					table.user.id,
					db
						.select({ data: table.registration.userId })
						.from(table.registration)
						.where(eq(table.registration.contestId, id)),
				),
			)
			.as("leaderboard");

		return db
			.select()
			.from(leaderboard)
			.orderBy(sql`JSONB_ARRAY_LENGTH("submissions") desc`)
			.limit(20);
	}
}

export namespace ContestAdminService {
	export async function create(contest: typeof ContestModel.insert.static) {
		return db.insert(table.contest).values(contest).returning();
	}

	export async function update(
		id: string,
		contest: typeof ContestModel.update.static,
	) {
		await db.update(table.contest).set(contest).where(eq(table.contest.id, id));
	}

	export async function remove(id: string) {
		await db.delete(table.contest).where(eq(table.contest.id, id));
	}

	export async function overview(id: string) {
		const [registrations, submitters, submissions] = await Promise.all([
			db.$count(table.registration, eq(table.registration.contestId, id)),
			db
				.select({
					data: countDistinct(table.submission.userId),
				})
				.from(table.submission)
				.where(eq(table.submission.contestId, id)),
			db.$count(table.submission, eq(table.submission.contestId, id)),
		]);

		return {
			registrations,
			submitters: submitters[0].data,
			submissions,
		};
	}
}
