import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { ProblemModel } from "@/api/models/problem";
import { TestcaseModel } from "@/api/models/testcase";
import boilerplateRaw from "./boilerplate.yaml?raw";
import { ProblemService } from "./service";

const boilerplate = Bun.YAML.parse(boilerplateRaw) as Record<string, string>;

export const problemApp = new Elysia({ prefix: "/problem" })
	.use(betterAuthPlugin)
	.guard({
		auth: "any",
		params: t.Object({ id: t.String({ description: "Contest ID" }) }),
	})
	.get(
		"/",
		async ({ params }) => {
			return ProblemService.getProblems(params.id);
		},
		{
			response: ProblemModel.groupSelect,
			detail: {
				summary: "List problems",
				description: "List all problems of a specific contest",
			},
		},
	)
	.group(
		"/:problem",
		{
			params: t.Object({
				problem: t.Numeric({
					description: "Problem number within the contest",
				}),
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
							description: "Get details of a specific problem in a contest",
						},
					},
				)
				.post(
					"/",
					async ({ auth, params }) => {
						return status(201, "Code submitted successfully");
					},
					{
						detail: {
							summary: "Submit solution",
							description:
								"Submit a solution for a specific problem in a contest",
						},
					},
				)
				.get(
					"/boilerplate/:language",
					async ({ params }) => {
						if (!(params.language in boilerplate)) {
							return { "@": "good luck" };
						}
						return { "@": boilerplate[params.language] };
					},
					{
						detail: {
							summary: "Get boilerplate code",
							description: "Get boilerplate code for a specific language",
						},
					},
				)
				.get(
					"/testcase",
					async ({ params }) => {
						const testcases = await ProblemService.getTestcases(
							params.id,
							params.problem,
						);
						return testcases;
					},
					{
						response: TestcaseModel.groupSelect,
						detail: {
							summary: "List testcases",
							description:
								"List all testcases for a specific problem in a contest",
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
						if (!auth.user.role?.includes("admin") && testcase.hidden) {
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
							testcase: t.Numeric({
								description: "Testcase number within the problem",
							}),
						}),
						detail: {
							summary: "Get testcase",
							description: "Get a specific testcase for a problem in a contest",
						},
					},
				),
	);
