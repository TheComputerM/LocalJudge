import { and, asc, desc, eq } from "drizzle-orm";
import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { db } from "@/db";
import * as table from "@/db/schema";
import { ContestModel } from "@/db/typebox/contest";

const contestController = new Elysia()
	.get(
		"/",
		async () =>
			await db
				.select()
				.from(table.contest)
				.orderBy(desc(table.contest.startTime)),
		{
			detail: {
				summary: "Get contests",
				description: "Get all contests present in the system",
			},
		},
	)
	.post(
		"/",
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
	.group("/:id", (app) =>
		app
			.get(
				"/",
				async ({ params }) => {
					const contest = await db.query.contest.findFirst({
						where: eq(table.contest.id, params.id),
					});
					if (!contest) return status(404, "Contest not found");
					return contest;
				},
				{
					detail: {
						summary: "Get contest",
						description: "Get details of a specific contest by its ID",
					},
				},
			)
			.group("/problem", (app) =>
				app
					.get(
						"/",
						async ({ params }) => {
							const problems = db.query.problem.findMany({
								where: eq(table.problem.contestId, params.id),
								columns: {
									description: false,
								},
								orderBy: asc(table.problem.number),
							});
							return problems;
						},
						{
							detail: {
								summary: "Get contest problems",
								description: "Get all problems of a specific contest by its ID",
							},
						},
					)
					.group(
						"/:problem",
						{
							params: t.Object({
								id: t.String(),
								problem: t.Number(),
							}),
						},
						(app) =>
							app.get(
								"/",
								async ({ params }) => {
									const problem = await db.query.problem.findFirst({
										where: and(
											eq(table.problem.contestId, params.id),
											eq(table.problem.number, params.problem),
										),
									});
									if (!problem) return status(404, "Problem not found");
									return problem;
								},
								{
									detail: {
										summary: "Get contest problem",
										description:
											"Get details of a specific problem in a contest by its ID and problem number",
									},
								},
							),
					),
			),
	);

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
	.group("/contest", (app) => app.use(contestController));
