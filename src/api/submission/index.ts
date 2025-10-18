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
	.get(
		"/:submission",
		async ({ params }) => {
			const submission = await SubmissionService.getSubmission(
				params.submission,
			);
			if (submission === undefined) return status(404, "Submission not found");
			return submission;
		},
		{
			response: {
				200: SubmissionModel.select,
				404: t.Literal("Submission not found"),
			},
			detail: {
				summary: "Get submission",
				description: "Retrieve details of a specific submission by its ID",
			},
		},
	);
