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
					params: t.Object({
						id: APIParams.contest,
					}),
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
							"/participant",
							async ({ params }) => {
								return AdminService.getParticipants(params.id);
							},
							{
								detail: {
									summary: "Get participants",
									description: "Get all the participants of a contest.",
								},
							},
						)
						.group(
							"/participant/:participant",
							{
								params: t.Object({
									id: APIParams.contest,
									participant: t.String(),
								}),
							},
							(app) =>
								app
									.get(
										"/",
										async ({ params }) => {
											return SubmissionService.getSubmissions({
												contest: params.id,
												user: params.participant,
											});
										},
										{
											detail: {
												summary: "Get submissions",
												description:
													"Get submissions for a specific participant in a contest.",
											},
										},
									)
									.get(
										"/timeline",
										async ({ params }) => {
											return AdminService.timeline(
												params.participant,
												params.id,
											);
										},
										{
											response: t.Array(ContestModel.timeline),
											detail: {
												summary: "Get timeline",
												description:
													"Get the edit history timeline for a specific participant in a contest.",
											},
										},
									),
						),
			),
	)
	.get(
		"/submission",
		async ({ query }) => {
			return SubmissionService.getSubmissions(
				{ contest: query.contest, problem: query.problem, user: query.user },
				query.pageSize,
				(query.page! - 1) * query.pageSize!,
			);
		},
		{
			query: t.Partial(
				t.Object({
					...AdminModel.PaginationQuery,
					contest: APIParams.contest,
					problem: APIParams.problem,
					user: t.String(),
				}),
			),
		},
	);
