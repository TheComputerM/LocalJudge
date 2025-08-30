import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "elysia";
import { localjudge } from "@/api/client";
import { ProblemModel } from "@/api/models/problem";
import { TestcaseModel } from "@/api/models/testcase";
import { useAppForm } from "@/components/form/primitives";
import { ProblemForm } from "@/components/form/problem";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/$id/problem/$problem")({
	loader: async ({ params }) => {
		const [problem, testcases] = await Promise.all([
			rejectError(
				localjudge.api
					.contest({ id: params.id })
					.problem({ problem: params.problem })
					.get(),
			),
			rejectError(
				localjudge.api
					.contest({ id: params.id })
					.problem({ problem: params.problem })
					.testcase.get(),
			).then((data) =>
				Promise.all(
					data.map((tc) =>
						rejectError(
							localjudge.api
								.contest({ id: params.id })
								.problem({ problem: params.problem })
								.testcase({ testcase: tc.number })
								.get(),
						),
					),
				),
			),
		]);
		return { problem, testcases };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { problem, testcases } = Route.useLoaderData();
	const { id, problem: problemNumber } = Route.useParams();

	const form = useAppForm({
		defaultValues: {
			problem: Value.Parse(ProblemModel.insert, problem),
			testcases: Value.Parse(t.Array(TestcaseModel.upsert), testcases),
		},
		onSubmit: async ({ value }) => {
			await localjudge.api.admin
				.contest({ id })
				.problem({ problem: problemNumber })
				.patch(value.problem);
			await localjudge.api.admin
				.contest({ id })
				.problem({ problem: problemNumber })
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
