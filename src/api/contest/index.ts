import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { PistonService } from "../piston/service";
import { ContestService, ProblemService } from "./service";

export const contestApp = new Elysia({
	prefix: "/contest",
	detail: { tags: ["Contest"] },
})
	.use(betterAuthPlugin)
	.guard({ auth: "any" })
	.get(
		"/",
		async ({ auth }) => {
			const contests = await ContestService.getContestsByUserId(auth.user.id);
			return contests;
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
			await ContestService.registerContest(body.code, auth.user.id);
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
			params: t.Object({ id: t.String() }),
		},
		(app) =>
			app
				.onBeforeHandle(async ({ params, auth }) => {
					const isRegistered = await ContestService.isRegistered(
						params.id,
						auth.user.id,
					);

					if (!isRegistered) {
						return status(403, "You are not registered for this contest");
					}
				})
				.get(
					"/",
					async ({ params }) => {
						const contest = await ContestService.getContest(params.id);
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
							const problems = await ProblemService.getProblems(params.id);
							return problems;
						})
						.group(
							"/:problem",
							{
								params: t.Object({
									id: t.String(),
									problem: t.Number(),
								}),
							},
							(app) =>
								app
									.get("/", async ({ params }) => {
										const problem = await ProblemService.getProblem(
											params.id,
											params.problem,
										);
										if (!problem) return status(404);
										return problem;
									})
									.post("/", async ({ auth, params }) => {
										await PistonService.submit(
											auth.user.id,
											params.id,
											params.problem,
										);
										return status(201, "Code submitted successfully");
									})
									.get("/testcase", async ({ params }) => {
										const testcases = await ProblemService.getTestcases(
											params.id,
											params.problem,
										);
										return testcases;
									}),
						),
				),
	);
