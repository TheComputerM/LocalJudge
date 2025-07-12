import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { ContestService } from "@/api/contest/service";
import { ContestModel } from "@/api/models/contest";
import { problemApp } from "./problem";

export const contestApp = new Elysia({
	prefix: "/contest",
	detail: { tags: ["Contest"] },
})
	.use(betterAuthPlugin)
	.guard({ auth: "any" })
	.get(
		"/",
		async ({ auth }) => {
			return ContestService.getContestsByUser(auth.user.id);
		},
		{
			response: t.Array(ContestModel.select),
			detail: {
				summary: "Get contests",
				description: "Get contests the user is participating in",
			},
		},
	)
	.post(
		"/",
		async ({ auth, body }) => {
			await ContestService.registerContest(body.code, auth.user.id);
			return status(201, "Successfully registered for the contest");
		},
		{
			body: t.Object({
				code: t.String(),
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
			params: t.Object({ id: t.String() }),
		},
		(app) =>
			app
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
				.use(problemApp),
	);
