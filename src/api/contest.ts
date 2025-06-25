import { and, eq } from "drizzle-orm";
import Elysia, { status, t } from "elysia";
import { db } from "@/db";
import * as table from "@/db/schema";
import { betterAuthPlugin } from "./better-auth";

export const contestApp = new Elysia({ prefix: "/contest" })
	.use(betterAuthPlugin)
	.guard({ auth: "any" })
	.get(
		"/",
		async ({ auth }) => {
			const contests = await db.query.userToContest.findMany({
				columns: {},
				where: eq(table.userToContest.userId, auth.user.id),
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
		async ({ auth, body }) => {
			await db
				.insert(table.userToContest)
				.values({ userId: auth.user.id, contestId: body.code });
			return status(201, {
				message: "Successfully registered for the contest.",
			});
		},
		{
			body: t.Object({
				code: t.String(),
			}),
		},
	)
	.group("/:contestId", (app) =>
		app
			.onBeforeHandle(async ({ params, auth }) => {
				const isRegistered =
					(await db.$count(
						table.userToContest,
						and(
							eq(table.userToContest.userId, auth.user.id),
							eq(table.userToContest.contestId, params.contestId),
						),
					)) > 0;

				if (!isRegistered) {
					return status(403, "You are not registered for this contest.");
				}
			})
			.get("/", async ({ params }) => {
				const data = await db.query.contest.findFirst({
					where: eq(table.contest.id, params.contestId),
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
			})
			.group("/problem/:problemId", (app) =>
				app
					.get("/", async ({ params }) => {
						const data = await db.query.problem.findFirst({
							where: eq(table.problem.id, params.problemId),
						});
						if (!data) return status(404);
						return data;
					})
					.post("/", async ({}) => {
						// TODO: submit code
					})
					.get("/testcase", async ({ params }) => {
						const data = await db.query.testcase.findMany({
							where: eq(table.testcase.problemId, params.problemId),
						});
						return data;
					}),
			),
	);
