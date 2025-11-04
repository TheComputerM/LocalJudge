import { asc, desc, eq, inArray } from "drizzle-orm";
import { ParticipantModel } from "@/api/models/participant";
import { db } from "@/db";
import * as table from "@/db/schema";
import { auth } from "@/lib/auth";

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
}
