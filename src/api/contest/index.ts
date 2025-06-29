import { and, asc, eq } from "drizzle-orm";
import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { db } from "@/db";
import * as table from "@/db/schema";

export const contestApp = new Elysia({
	prefix: "/contest",
	detail: { tags: ["Contest"] },
})
	.use(betterAuthPlugin)
	.guard({ auth: "any" })
	.get(
		"/",
		async ({ auth }) => {
			const contests = await db.query.registration.findMany({
				columns: {},
				where: eq(table.registration.userId, auth.user.id),
				with: {
					contest: true,
				},
			});

			return contests.map(({ contest }) => contest);
		},
		{
			detail: {
				summary: "Get contests",
				description: "Get contests the user is participating in",
			},
		},
	)
	.post(
		"/",
		async ({ auth, body }) => {
			await db
				.insert(table.registration)
				.values({ userId: auth.user.id, contestId: body.code });
			return status(201, "Successfully registered for the contest");
		},
		{
			body: t.Object({
				code: t.String(),
			}),
			detail: {
				summary: "Register for contest",
				description:
					"Register the current user for a contest using the contest ID",
			},
		},
	)
	.group(
		"/:id",
		{
			params: t.Object({ id: t.String({ description: "Contest ID" }) }),
		},
		(app) =>
			app
				.onBeforeHandle(async ({ params, auth }) => {
					const isRegistered =
						(await db.$count(
							table.registration,
							and(
								eq(table.registration.userId, auth.user.id),
								eq(table.registration.contestId, params.id),
							),
						)) > 0;

					if (!isRegistered) {
						return status(403, "You are not registered for this contest");
					}
				})
				.get(
					"/",
					async ({ params }) => {
						const contest = await db.query.contest.findFirst({
							where: eq(table.contest.id, params.id),
						});
						if (!contest) return status(404);
						return contest;
					},
					{
						detail: {
							summary: "Get contest details",
							description: "Get details of a contest by using its ID",
						},
					},
				)
				.group("/problem", (app) =>
					app
						.get("/", async ({ params }) => {
							const problems = await db.query.problem.findMany({
								where: eq(table.problem.contestId, params.id),
								columns: {
									description: false,
								},
								orderBy: asc(table.problem.number),
							});
							return problems;
						})
						.group(
							"/:problem",
							{
								params: t.Object({
									id: t.String({ description: "Contest ID" }),
									problem: t.Number({ description: "Problem number" }),
								}),
							},
							(app) =>
								app
									.derive(({ params }) => {
										const problemId = `${params.id}/${params.problem}`;
										return { problemId };
									})
									.get("/", async ({ problemId }) => {
										const problem = await db.query.problem.findFirst({
											where: eq(table.problem.id, problemId),
										});
										if (!problem) return status(404);
										return problem;
									})
									.post("/", async ({ problemId }) => {
										// TODO: submit code for contest
									})
									.get("/testcase", async ({ problemId }) => {
										const testcases = await db.query.testcase.findMany({
											where: eq(table.testcase.problemId, problemId),
										});
										return testcases;
									}),
						),
				),
	);
