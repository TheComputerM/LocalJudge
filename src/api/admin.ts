import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { db } from "@/db";
import { contest, submission, user } from "@/db/schema";

export const adminApp = new Elysia({ prefix: "/admin" }).get(
	"/dashboard",
	async () => {
		const statistics = await Promise.all([
			db.$count(contest),
			db.$count(user, eq(user.role, "user")),
			db.$count(submission),
		]);
		return {
			statistics: {
				contests: statistics[0],
				participants: statistics[1],
				submissions: statistics[2],
			},
		};
	},
);
