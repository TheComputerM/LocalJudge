import Elysia, { status, t } from "elysia";
import { ContestModel } from "@/db/typebox/contest";
import { ContestService, ProblemService } from "../contest/service";
import { AdminService } from "./service";

export const adminContestApp = new Elysia({ prefix: "/contest" })
	.get(
		"/",
		async () => {
			const contests = ContestService.getContests();
			return contests;
		},
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
							const problems = ProblemService.getProblems(params.id);
							return problems;
						},
						{
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
							app.get(
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
