import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { ContestModel } from "@/api/models/contest";
import { ProblemModel } from "@/api/models/problem";
import { PistonService } from "@/api/piston/service";
import { ContestService } from "@/api/services/contest";
import { ProblemService } from "@/api/services/problem";

export const contestApp = new Elysia({
	prefix: "/contest",
	detail: { tags: ["Contest"] },
})
	.use(betterAuthPlugin)
	.guard({ auth: "any" })
	.get(
		"/",
		async ({ auth }) => {
			return ContestService.getContestsByUser(auth.user.id);
		},
		{
			response: t.Array(ContestModel.select),
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
					const isRegistered = await ContestService.isUserRegistered(
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
						if (!contest) return status(404, "Contest not found");
						return contest;
					},
					{
						response: {
							200: ContestModel.select,
							404: t.Literal("Contest not found"),
						},
						detail: {
							summary: "Get contest details",
							description: "Get details of a contest by using its ID",
						},
					},
				)
				.group("/problem", (app) =>
					app
						.get(
							"/",
							async ({ params }) => {
								return ProblemService.getProblems(params.id);
							},
							{
								response: ProblemModel.listSelect,
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
								app
									.get(
										"/",
										async ({ params }) => {
											const problem = await ProblemService.getProblem(
												params.id,
												params.problem,
											);
											if (!problem) return status(404, "Problem not found");
											return problem;
										},
										{
											response: {
												200: ProblemModel.select,
												404: t.Literal("Problem not found"),
											},
										},
									)
									.post("/", async ({ auth, params }) => {
										await PistonService.submit(
											auth.user.id,
											params.id,
											params.problem,
											"print(input())",
											"python@3.12.0",
										);
										return status(201, "Code submitted successfully");
									})
									.get("/testcase", async ({ params }) => {
										const testcases = await ProblemService.getTestcases(
											params.id,
											params.problem,
											{ includeHidden: false },
										);
										return testcases;
									})
									.get("/submission", async ({ params }) => {
										// TODO: return submissions for the problem by the user
									}),
						),
				),
	);
