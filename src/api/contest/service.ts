import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as table from "@/db/schema";

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

	/** Register a user for a contest */
	export async function registerContest(contestId: string, userId: string) {
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

	export async function getContests() {
		return db.query.contest.findMany({
			orderBy: asc(table.contest.startTime),
		});
	}

	/** Get all contests a user is registered for */
	export async function getContestsByUser(userId: string) {
		const registrations = await db.query.registration.findMany({
			columns: {},
			where: eq(table.registration.userId, userId),
			with: {
				contest: true,
			},
			// TODO: order by start time
		});

		return registrations.map(({ contest }) => contest);
	}
}
