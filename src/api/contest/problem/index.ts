import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { LocalboxService } from "@/api/localbox/service";
import { APIParams } from "@/api/models/params";
import boilerplateYAML from "./boilerplate.yaml?raw";
import { ProblemModel } from "./model";
import { ProblemAdminService, ProblemService } from "./service";
import { testcaseApp } from "./testcase";

const boilerplate = Bun.YAML.parse(boilerplateYAML) as Record<string, string>;

export const problemApp = new Elysia({
	prefix: "/problem",
	detail: { tags: ["Problem"] },
})
	.use(betterAuthPlugin)
	.guard({
		auth: "any",
		params: t.Object({ id: APIParams.contest }),
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
	.post(
		"/",
		async ({ params, body }) => {
			return ProblemAdminService.createProblem(params.id, body);
		},
		{
			auth: "admin",
			body: ProblemModel.insert,
			detail: {
				summary: "Add problem to contest",
				description: "Add a new problem to a specific contest",
			},
		},
	)
	.group(
		"/:problem",
		{
			params: t.Object({
				problem: APIParams.problem,
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
				.patch(
					"/",
					async ({ params, body }) => {
						return ProblemAdminService.updateProblem(
							params.id,
							params.problem,
							body,
						);
					},
					{
						body: ProblemModel.update,
						detail: {
							summary: "Update problem",
							description: "Update a specific problem in a contest",
						},
					},
				)
				.post(
					"/submit/:language",
					async ({ auth, params, body }) => {
						await LocalboxService.submit(
							auth.user.id,
							params.id,
							params.problem,
							params.language,
							body,
						);
						return status(201, "Code submitted successfully");
					},
					{
						detail: {
							summary: "Submit solution",
							description:
								"Submit a solution for a specific problem in a contest",
						},
						body: t.String(),
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
				.use(testcaseApp),
	);
