import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { ContestModel } from "@/api/contest/model";
import { ContestAdminService, ContestService } from "@/api/contest/service";
import { SubmissionService } from "@/api/submission/service";
import { APIParams } from "../models/params";
import { SubmissionModel } from "../submission/model";
import { problemApp } from "./problem";

export const contestApp = new Elysia({
	prefix: "/contest",
	detail: { tags: ["Contest"] },
})
	.use(betterAuthPlugin)
	.guard({
		auth: "any",
	})
	.get(
		"/",
		async ({ auth }) => {
			return ContestService.getContestsByUser(auth.user.id);
		},
		{
			response: t.Array(ContestModel.select),
			detail: {
				summary: "List contests",
				description: "List contests the user is participating in",
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			return ContestAdminService.create(body);
		},
		{
			auth: "admin",
			body: ContestModel.insert,
			detail: {
				summary: "Create contest",
				description: "Create a new contest with the given details",
			},
		},
	)
	.post(
		"/register",
		async ({ auth, body }) => {
			await ContestService.register(body.code, auth.user.id);
			return status(201, "Successfully registered for the contest");
		},
		{
			body: t.Object({
				code: t.String({ description: "Contest ID" }),
			}),
			detail: {
				summary: "Register for contest",
				description:
					"Register the current user for a contest using the contest ID",
			},
		},
	)
	.group(
		"/:id",
		{
			params: t.Object({ id: APIParams.contest }),
			beforeHandle: async ({ params }) => {
				if (!(await ContestService.isExists(params.id))) {
					return status(404, "Contest not found");
				}
			},
		},
		(app) =>
			app
				.guard(
					{
						auth: "admin",
					},
					(app) =>
						app
							.patch(
								"/",
								async ({ params, body }) => {
									await ContestAdminService.update(params.id, body);
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
							.delete(
								"/",
								async ({ params }) => {
									try {
										await ContestAdminService.remove(params.id);
										return status(204);
									} catch (error) {
										return status(
											500,
											`Failed to delete contest: ${JSON.stringify(error)}`,
										);
									}
								},
								{
									detail: {
										summary: "Delete contest",
										description: "Delete a specific contest by its ID",
									},
								},
							)
							.get(
								"/overview",
								async ({ params }) => {
									return ContestAdminService.overview(params.id);
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
							),
				)
				.onBeforeHandle(async ({ params, auth }) => {
					if (auth.user.role?.includes("admin")) return;

					const isRegistered = await ContestService.isUserRegistered(
						params.id,
						auth.user.id,
					);

					if (!isRegistered) {
						return status(403, "You are not registered for this contest");
					}
				})
				.get(
					"/",
					async ({ params }) => {
						const contest = await ContestService.getContest(params.id);
						return contest!;
					},
					{
						response: ContestModel.select,
						detail: {
							summary: "Get contest",
							description: "Get details of a specific contest",
						},
					},
				)
				.get(
					"/leaderboard",
					async ({ params }) => {
						return ContestService.leaderboard(params.id);
					},
					{
						detail: {
							summary: "Get leaderboard",
							description: "Get the leaderboard for a specific contest",
						},
					},
				)
				.get(
					"/submission",
					async ({ auth, params }) => {
						return SubmissionService.getSubmissions({
							contest: params.id,
							user: auth.user.id,
						});
					},
					{
						response: SubmissionModel.groupSelect,
						detail: {
							summary: "Get submissions for contest",
							description:
								"Get all submissions made by the current user for a specific contest",
						},
					},
				)
				.use(problemApp),
	);
