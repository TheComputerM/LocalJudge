import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { ContestModel } from "@/api/contest/model";
import { ContestService } from "../contest/service";
import { AdminService } from "./service";

export const adminApp = new Elysia({
	prefix: "/admin",
	detail: { tags: ["Admin"] },
})
	.use(betterAuthPlugin)
	.guard({ auth: "admin" })
	.get(
		"/overview",
		async () => {
			return AdminService.getOverview();
		},
		{
			detail: {
				summary: "Get admin overview",
				description:
					"Get an overview of the admin statistics including contests, participants, and submissions",
			},
		},
	)
	.group("/contest", (app) =>
		app
			.get(
				"/",
				async () => {
					return AdminService.getContests();
				},
				{
					response: t.Array(ContestModel.select),
					detail: {
						summary: "List contests",
						description: "List all contests present in the system",
					},
				},
			)
			.group(
				"/:id",
				{
					beforeHandle: async ({ params }) => {
						if (!(await ContestService.isExists(params.id))) {
							return status(404, "Contest not found");
						}
					},
				},
				(app) =>
					app.get(
						"/results",
						async () => {
							// TODO: Implement contest results retrieval
						},
						{
							detail: {
								summary: "Get contest results",
								description: "Get the results for a specific contest",
							},
						},
					),
			),
	)
	.group("/participant", (app) =>
		app.get(
			"/",
			async () => {
				return AdminService.getParticipants();
			},
			{
				detail: {
					summary: "List participants",
					description: "List all participants present in the system",
				},
			},
		),
	);
