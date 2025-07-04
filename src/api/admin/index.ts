import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { db } from "@/db";
import * as table from "@/db/schema";
import { adminContestApp } from "./contest";

export const adminApp = new Elysia({
	prefix: "/admin",
	detail: { tags: ["Admin"] },
})
	.use(betterAuthPlugin)
	.guard({ auth: "admin" })
	.get(
		"/overview",
		async () => {
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
		},
		{
			detail: {
				summary: "Get admin overview",
				description:
					"Get an overview of the admin statistics including contests, participants, and submissions",
			},
		},
	)
	.group("/contest", (app) => app.use(adminContestApp));
