import Elysia, { status, t } from "elysia";
import { ContestModel } from "@/api/models/contest";
import { AdminService } from "@/api/services/admin";
import { ContestService } from "@/api/services/contest";

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
							app.put("/", async ({ params }) => {
								// TODO: update problem
							}),
					),
			),
	);
