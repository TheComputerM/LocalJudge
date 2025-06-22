import { and, eq } from "drizzle-orm";
import Elysia, { status } from "elysia";
import { db } from "@/db";
import { contest, userToContest } from "@/db/schema";
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
	.group("/:id", (app) =>
		app
			.onBeforeHandle(async ({ params, auth }) => {
				const isRegistered =
					(await db.$count(
						userToContest,
						and(
							eq(userToContest.userId, auth.user.id),
							eq(userToContest.contestId, params.id),
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
					where: eq(contest.id, params.id),
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
