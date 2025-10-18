import { asc, desc, eq } from "drizzle-orm";
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

	export async function getParticipants() {
		return db.query.user.findMany({
			where: eq(table.user.role, "user"),
			orderBy: desc(table.user.createdAt),
		});
	}

	export async function createParticipant(
		data: typeof ParticipantModel.insert.static,
	) {
		const { user } = await auth.api.createUser({
			body: {
				...data,
				role: "user",
			},
		});
		return user;
	}
}
