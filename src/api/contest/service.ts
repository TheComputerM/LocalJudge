import { and, asc, eq } from "drizzle-orm";
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
		const [registrations, submissions] = await Promise.all([
			db.$count(table.registration, eq(table.registration.contestId, id)),
			db.$count(table.submission, eq(table.submission.contestId, id)),
		]);

		return {
			registrations,
			submissions,
		};
	}
}
