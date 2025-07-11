import Elysia, { status, t } from "elysia";
import { ContestModel } from "@/api/models/contest";
import { ProblemModel } from "@/api/models/problem";
import { AdminService } from "@/api/services/admin";
import { ContestService } from "@/api/services/contest";
import { ProblemService } from "@/api/services/problem";

/**
 * Admin's control interface for managing contests and problems.
 */
export const adminContestApp = new Elysia({ prefix: "/contest" })
	.get(
		"/",
		async () => {
			const contests = await ContestService.getContests();
			return contests;
		},
		{
			response: t.Array(ContestModel.select),
			detail: {
				summary: "Get contests",
				description: "Get all contests present in the system",
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
			.put(
				"/",
				async ({ params, body }) => {
					await AdminService.updateContest(params.id, body);
					return status(204);
				},
				{
					body: ContestModel.insert,
					detail: {
						summary: "Update contest",
						description: "Update a specific contest by its ID",
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
							detail: {
								summary: "Get contest problems",
								description: "Get all problems of a specific contest",
							},
						},
					)
					.post(
						"/",
						async ({ params }) => {
							// TODO: add problem to contest
						},
						{
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
											summary: "Get contest problem",
											description:
												"Get details of a specific problem in a contest by its ID and problem number",
										},
									},
								)
								.group("/testcase", (app) =>
									app.get("/", async ({ params }) => {
										const testcases = await ProblemService.getTestcases(
											params.id,
											params.problem,
											{ includeHidden: true },
										);
										return testcases;
									}),
								),
					),
			),
	);
