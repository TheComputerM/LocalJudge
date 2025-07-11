import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { TestcaseModel } from "@/api/models/testcase";
import { useAppForm } from "@/components/form/primitives";
import { ProblemForm } from "@/components/form/problem";

export const Route = createFileRoute("/admin/contest/$id/problem/new")({
	component: RouteComponent,
});

function RouteComponent() {
	const contestId = Route.useParams({ select: (data) => data.id });
	const form = useAppForm({
		defaultValues: {
			problem: {
				title: "",
				description: "",
			},
			testcases: [] as typeof TestcaseModel.Group.insert.static,
		},
		onSubmit: async ({ value }) => {
			await localjudge.api.admin
				.contest({
					id: contestId,
				})
				.problem.post(value.problem);
		},
	});
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<ProblemForm form={form} />
		</form>
	);
}
