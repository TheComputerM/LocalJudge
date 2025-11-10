import Elysia, { sse, status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { LocalboxService } from "@/api/localbox/service";
import { APIParams } from "@/api/models/params";
import { SubmissionService } from "@/api/submission/service";
import { ProblemModel } from "./model";
import { ProblemAdminService, ProblemService } from "./service";
import { testcaseApp } from "./testcase";

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
			return ProblemAdminService.create(params.id, body);
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
			beforeHandle: async ({ params }) => {
				if (!(await ProblemService.isExists(params.id, params.problem))) {
					return status(404, "Problem not found");
				}
			},
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
						return problem!;
					},
					{
						response: ProblemModel.select,
						detail: {
							summary: "Get problem",
							description: "Get details of a specific problem in a contest",
						},
					},
				)
				.guard(
					{
						auth: "admin",
					},
					(app) =>
						app
							.patch(
								"/",
								async ({ params, body }) => {
									return ProblemAdminService.update(
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
							.delete(
								"/",
								async ({ params }) => {
									try {
										await ProblemAdminService.remove(params.id, params.problem);
										return status(204);
									} catch (error) {
										return status(
											500,
											`Failed to delete problem: ${JSON.stringify(error)}`,
										);
									}
								},
								{
									detail: {
										summary: "Delete Problem",
										description: "",
									},
								},
							),
				)
				.post(
					"/submit/:language",
					async function* ({ auth, params, body }) {
						const submissionId = await LocalboxService.submit(
							auth.user.id,
							params.id,
							params.problem,
							params.language,
							body,
						);
						const watcher = SubmissionService.notifier.get(submissionId);
						if (!watcher) {
							return;
						}
						for await (const value of watcher) {
							yield sse({ data: value });
						}
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
					"/snapshot/:language",
					async ({ params, auth }) => {
						return ProblemService.getSnapshot(
							auth.user.id,
							params.id,
							params.problem,
							params.language,
						);
					},
					{
						response: t.String(),
						detail: {
							summary: "Get code from snapshot",
							description: "Get boilerplate code for a specific language",
						},
					},
				)
				.use(testcaseApp),
	);
