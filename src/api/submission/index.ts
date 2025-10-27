import Elysia, { status, t } from "elysia";
import { betterAuthPlugin } from "../better-auth";
import { SubmissionModel } from "./model";
import { SubmissionService } from "./service";

export const submissionApp = new Elysia({
	prefix: "/submission",
	detail: { tags: ["Submission"] },
})
	.use(betterAuthPlugin)
	.guard({ auth: "any" })
	.get(
		"/",
		async ({ auth }) => {
			return SubmissionService.getSubmissions({ user: auth.user.id });
		},
		{
			response: SubmissionModel.groupSelect,
			detail: {
				summary: "List user submissions",
				description: "List all submissions made by the user",
			},
		},
	)
	.group(
		"/:submission",
		{
			async beforeHandle({ params }) {
				if (!(await SubmissionService.isExists(params.submission))) {
					return status(404, "Submission not found");
				}
			},
			response: {
				404: t.Literal("Submission not found"),
			},
		},
		(app) =>
			app
				.get(
					"/",
					async ({ params }) => {
						const submission = await SubmissionService.getSubmission(
							params.submission,
						);
						return submission!;
					},
					{
						response: SubmissionModel.select,
						detail: {
							summary: "Get submission",
							description:
								"Retrieve details of a specific submission by its ID",
						},
					},
				)
				.get(
					"/status",
					async ({ params }) => {
						return SubmissionService.getStatus(params.submission);
					},
					{
						response: SubmissionModel.status,
						detail: {
							summary: "Get submission status",
							description:
								"Retrieve the number of total and passed test cases for a submission",
						},
					},
				)
				.get(
					"/results",
					async ({ params }) => {
						return SubmissionService.getResults(params.submission);
					},
					{
						response: t.Array(SubmissionModel.Result.select),
						detail: {
							summary: "Get submission results",
							description:
								"Retrieve detailed results for each test case of a submission",
						},
					},
				),
	);
