import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { ContestModel } from "@/api/contest/model";
import { ContestService } from "../contest/service";
import { APIParams } from "../models/params";
import { SubmissionService } from "../submission/service";
import { AdminModel } from "./model";
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
					app
						.get(
							"/overview",
							async ({ params }) => {
								return AdminService.contestOverview(params.id);
							},
							{
								response: t.Object({
									registrations: t.Number(),
									submitters: t.Number(),
									submissions: t.Number(),
								}),
								detail: {
									summary: "Contest overview",
									description:
										"Get an overview of a specific contest including registrations and submissions count",
								},
							},
						)
						.get(
							"/results",
							async ({ params, set }) => {
								const [output, contestName] = await Promise.all([
									AdminService.getResults(params.id),
									ContestService.getContest(params.id).then((c) => c!.name),
								]);
								set.headers["Content-Type"] = "application/json";
								set.headers["Content-Disposition"] =
									`attachment; filename="${contestName} results.json"`;
								return JSON.stringify(output, null, 2);
							},
							{
								detail: {
									summary: "Get contest results",
									description:
										"Download the results in for a specific contest in JSON format.",
								},
							},
						)
						.get(
							"/timeline/:user",
							async ({ params }) => {
								return AdminService.timeline(params.user, params.id);
							},
							{
								response: t.Array(ContestModel.timeline),
							},
						),
			),
	)
	.get(
		"/submission",
		async ({ query }) => {
			return SubmissionService.getSubmissions(
				{},
				query.pageSize,
				(query.page! - 1) * query.pageSize!,
			);
		},
		{
			query: AdminModel.ListQuery,
		},
	);
