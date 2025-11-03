import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "elysia";
import { localjudge } from "@/api/client";
import { ProblemModel } from "@/api/contest/problem/model";
import { TestcaseModel } from "@/api/contest/problem/testcase/model";
import { useAppForm } from "@/components/form/primitives";
import { ProblemForm } from "@/components/form/problem";
import { toastManager } from "@/components/ui/toast";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute(
	"/_authenticated/admin/contest/$id/problem/$problem",
)({
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
			).then((testcases) =>
				Promise.all(
					testcases.map((testcase) =>
						rejectError(
							localjudge
								.contest({ id: params.id })
								.problem({ problem: params.problem })
								.testcase({ testcase: testcase.number })
								.get(),
						).then((value) => ({ number: testcase.number, ...value })),
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
			const { error: errorProblem } = await localjudge
				.contest({ id })
				.problem({ problem: problemNumber })
				.patch(value.problem);
			if (errorProblem) {
				toastManager.add({
					title: "Failed to update problem",
					description: JSON.stringify(errorProblem),
					type: "error",
				});
				return;
			}
			const { error: errorTestcases } = await localjudge
				.contest({ id })
				.problem({ problem: problemNumber })
				.testcase.put(value.testcases);
			if (errorTestcases) {
				toastManager.add({
					title: "Failed to update testcases",
					description: JSON.stringify(errorTestcases),
					type: "error",
				});
				return;
			}
			toastManager.add({
				title: "Problem updated",
				type: "success",
			});
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
