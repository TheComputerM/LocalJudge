import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "elysia";
import { localjudge } from "@/api/client";
import { ProblemModel } from "@/api/contest/problem/model";
import { TestcaseModel } from "@/api/contest/problem/testcase/model";
import { useAppForm } from "@/components/form/primitives";
import { ProblemForm } from "@/components/form/problem";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/$id/problem/$problem")({
	loader: async ({ params }) => {
		const [problem, testcases] = await Promise.all([
			rejectError(
				localjudge
					.contest({ id: params.id })
					.problem({ problem: params.problem })
					.get(),
			),
			rejectError(
				localjudge
					.contest({ id: params.id })
					.problem({ problem: params.problem })
					.testcase.get(),
			).then((data) =>
				Promise.all(
					data.map((tc) =>
						rejectError(
							localjudge
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
			await localjudge
				.contest({ id })
				.problem({ problem: problemNumber })
				.patch(value.problem);
			// TODO: don't do this because all the results will be invalidated because the
			// testcases are recreated
			await localjudge
				.contest({ id })
				.problem({ problem: problemNumber })
				.testcase.delete();
			for (const testcase of value.testcases) {
				await localjudge
					.contest({ id })
					.problem({ problem: problemNumber })
					.testcase.post(testcase);
			}
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
