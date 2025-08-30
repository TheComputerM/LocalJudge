import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "elysia";
import { localjudge } from "@/api/client";
import { ProblemModel } from "@/api/models/problem";
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
			problem: Value.Cast(
				ProblemModel.insert,
				Value.Default(ProblemModel.insert, {}),
			),
			testcases: Value.Cast(t.Array(TestcaseModel.upsert), []),
		},
		onSubmit: async ({ value }) => {
			const { data, error } = await localjudge.api.admin
				.contest({
					id: contestId,
				})
				.problem.post(value.problem);
			if (error) {
				alert(JSON.stringify(error));
				return;
			}
			await localjudge.api.admin
				.contest({ id: contestId })
				.problem({ problem: data.number })
				.testcase.put(value.testcases);
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
