import { desc, eq } from "drizzle-orm";
import Elysia from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { db } from "@/db";
import * as table from "@/db/schema";
import { ContestModel } from "@/db/typebox/contest";

export const adminApp = new Elysia({
	prefix: "/admin",
	detail: { tags: ["Admin"] },
})
	.use(betterAuthPlugin)
	.guard({ auth: "admin" })
	.get(
		"/contest",
		async () => {
			return await db
				.select()
				.from(table.contest)
				.orderBy(desc(table.contest.startTime));
		},
		{
			detail: {
				summary: "Get contests",
				description: "Get all contests present in the system",
			},
		},
	)
	.post(
		"/contest",
		async ({ body }) => {
			const [data] = await db.insert(table.contest).values(body).returning();
			return data;
		},
		{
			body: ContestModel.insert,
			detail: {
				summary: "Create new contest",
				description: "Create a new contest with the given details",
			},
		},
	)
	.get("/overview", async () => {
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
	});
