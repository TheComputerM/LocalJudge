import { and, asc, countDistinct, desc, eq, inArray } from "drizzle-orm";
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

	export async function getContests() {
		return db.query.contest.findMany({
			orderBy: asc(table.contest.startTime),
		});
	}

	export async function getParticipants(contestId: string) {
		return db.query.user.findMany({
			where: inArray(
				table.user.id,
				db
					.select({ data: table.registration.userId })
					.from(table.registration)
					.where(eq(table.registration.contestId, contestId)),
			),
		});
	}

	export async function contestOverview(id: string) {
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

	export async function getResults(contestId: string) {
		return db.query.user.findMany({
			columns: {
				image: false,
				role: false,
				emailVerified: false,
			},
			where: inArray(
				table.user.id,
				db
					.select({ data: table.registration.userId })
					.from(table.registration)
					.where(eq(table.registration.contestId, contestId)),
			),
			with: {
				submissions: {
					columns: {
						content: false,
					},
					where: eq(table.submission.contestId, contestId),
					with: {
						results: true,
					},
					orderBy: desc(table.submission.createdAt),
				},
			},
		});
	}

	export async function timeline(userId: string, contestId: string) {
		return db.query.timeline.findMany({
			columns: {
				patch: true,
				createdAt: true,
			},
			where: and(
				eq(table.timeline.contestId, contestId),
				eq(table.timeline.userId, userId),
			),
			orderBy: asc(table.timeline.createdAt),
		});
	}
}
