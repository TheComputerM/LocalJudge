import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { ContestModel } from "@/api/models/contest";
import { ProblemModel } from "@/api/models/problem";
import { TestcaseModel } from "@/api/models/testcase";
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
					if (auth.user.role?.includes("admin")) return;

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
							summary: "Get contest",
							description: "Get details of a specific contest",
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
								response: ProblemModel.groupSelect,
								detail: {
									summary: "Get contest problems",
									description: "Get all problems of a specific contest",
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
											detail: {
												summary: "Get problem",
												description:
													"Get details of a specific problem in a contest",
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
									.get(
										"/testcase",
										async ({ params, auth }) => {
											const testcases = await ProblemService.getTestcases(
												params.id,
												params.problem,
											);
											return testcases;
										},
										{
											response: TestcaseModel.groupSelect,
											detail: {
												summary: "Get problem testcases",
												description:
													"Get all testcases for a specific problem in a contest",
											},
										},
									)
									.get(
										"/testcase/:testcase",
										async ({ params, auth }) => {
											const testcase = await ProblemService.getTestcase(
												params.id,
												params.problem,
												params.testcase,
											);
											if (!testcase) return status(404, "Testcase not found");
											if (
												!auth.user.role?.includes("admin") &&
												testcase.hidden
											) {
												return status(403, "Testcase is hidden");
											}
											return testcase;
										},
										{
											response: {
												200: TestcaseModel.select,
												404: t.Literal("Testcase not found"),
												403: t.Literal("Testcase is hidden"),
											},
											params: t.Object({
												id: t.String(),
												problem: t.Number(),
												testcase: t.Number(),
											}),
											detail: {
												summary: "Get testcase",
												description:
													"Get a specific testcase for a problem in a contest",
											},
										},
									)
									.get("/submission", async ({ params }) => {
										// TODO: return submissions for the problem by the user
									}),
						),
				),
	);
