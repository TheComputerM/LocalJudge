import { and, eq } from "drizzle-orm";
import Elysia, { status } from "elysia";
import { db } from "@/db";
import { contest, userToContest } from "@/db/schema";
import { contestInsertSchema } from "@/db/typebox/contest";
import { betterAuthPlugin } from "./better-auth";

export const contestApp = new Elysia({ prefix: "/contest" })
	.use(betterAuthPlugin)
	.guard({ auth: "any" })
	.get(
		"/",
		async ({ auth }) => {
			const contests = await db.query.userToContest.findMany({
				columns: {},
				where: eq(userToContest.userId, auth.user.id),
				with: {
					contest: true,
				},
			});

			return contests.map((c) => c.contest);
		},
		{
			detail: {
				description: "Get all contests the user is participating in.",
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			if (body.startTime >= body.endTime) {
				return status(400, "Start time must be before end time.");
			}
			const data = await db.insert(contest).values(body).returning();
			return data[0];
		},
		{
			auth: "admin",
			body: contestInsertSchema,
		},
	)
	.group("/:contestId", (app) =>
		app
			.onBeforeHandle(async ({ params, auth }) => {
				const isRegistered =
					(await db.$count(
						userToContest,
						and(
							eq(userToContest.userId, auth.user.id),
							eq(userToContest.contestId, params.contestId),
						),
					)) > 0;

				if (!isRegistered) {
					return status(403, {
						message: "You are not registered for this contest.",
					});
				}
			})
			.get("/", async ({ params }) => {
				const data = await db.query.contest.findFirst({
					where: eq(contest.id, params.contestId),
					with: {
						problems: {
							columns: {
								id: true,
								title: true,
							},
						},
					},
				});
				if (!data) return status(404);
				return data;
			}),
	);
