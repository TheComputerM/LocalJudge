import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { TestcaseModel } from "@/api/contest/problem/testcase/model";
import { APIParams } from "@/api/models/params";
import { TestcaseAdminService, TestcaseService } from "./service";

export const testcaseApp = new Elysia({
	prefix: "/testcase",
	detail: { tags: ["Testcase"] },
})
	.use(betterAuthPlugin)
	.guard({
		auth: "any",
		params: t.Object({
			id: APIParams.contest,
			problem: APIParams.problem,
		}),
	})
	.get(
		"/",
		async ({ params }) => {
			const testcases = await TestcaseService.getTestcases(
				params.id,
				params.problem,
			);
			return testcases;
		},
		{
			response: TestcaseModel.groupSelect,
			detail: {
				summary: "List testcases",
				description: "List all testcases for a specific problem in a contest",
			},
		},
	)
	.put(
		"/",
		async ({ params, body }) => {
			return await TestcaseAdminService.upsertTestcases(
				params.id,
				params.problem,
				body,
			);
		},
		{
			auth: "admin",
			body: t.Array(TestcaseModel.upsert),
			detail: {
				summary: "Upsert testcases",
				description:
					"Insert or update testcases for a specific problem in a contest",
			},
		},
	)
	.group(
		"/:testcase",
		{
			params: t.Object({
				testcase: APIParams.testcase,
			}),
		},
		(app) =>
			app.get(
				"/",
				async ({ params, auth }) => {
					const testcase = await TestcaseService.getTestcase(
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
