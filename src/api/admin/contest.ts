import Elysia, { status, t } from "elysia";
import { AdminService } from "@/api/admin/service";
import { ContestService } from "@/api/contest/service";
import { ContestModel } from "@/api/models/contest";
import { ProblemModel } from "@/api/models/problem";
import { TestcaseModel } from "@/api/models/testcase";

/**
 * Admin's control interface for managing contests and problems.
 */
export const adminContestApp = new Elysia({ prefix: "/contest" })
	.get(
		"/",
		async () => {
			return ContestService.getContests();
		},
		{
			response: t.Array(ContestModel.select),
			detail: {
				summary: "List contests",
				description: "List all contests present in the system",
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return AdminService.createContest(body);
		},
		{
			body: ContestModel.insert,
			detail: {
				summary: "Create contest",
				description: "Create a new contest with the given details",
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
				.patch(
					"/",
					async ({ params, body }) => {
						await AdminService.updateContest(params.id, body);
						return status(204);
					},
					{
						body: ContestModel.update,
						detail: {
							summary: "Update contest",
							description: "Update a specific contest by its ID",
						},
					},
				)
				.group("/problem", (app) =>
					app
						.post(
							"/",
							async ({ params, body }) => {
								return AdminService.createProblem(params.id, body);
							},
							{
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
									problem: t.Numeric(),
								}),
							},
							(app) =>
								app
									.patch(
										"/",
										async ({ params, body }) => {
											return AdminService.updateProblem(
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
									.group("/testcase", (app) =>
										app.put(
											"/",
											async ({ params, body }) => {
												return await AdminService.upsertTestcases(
													params.id,
													params.problem,
													body,
												);
											},
											{
												body: t.Array(TestcaseModel.upsert),
												detail: {
													summary: "Upsert testcases",
													description:
														"Insert or update testcases for a specific problem in a contest",
												},
											},
										),
									),
						),
				),
	);
