import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "elysia";
import { localjudge } from "@/api/client";
import { ProblemModel } from "@/api/contest/problem/model";
import { TestcaseModel } from "@/api/contest/problem/testcase/model";
import { useAppForm } from "@/components/form/primitives";
import { ProblemForm, ProblemFormOptions } from "@/components/form/problem";
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
		...ProblemFormOptions,
		defaultValues: {
			problem: Value.Parse(ProblemModel.insert, problem),
			testcases: Value.Parse(t.Array(TestcaseModel.insert), testcases),
		},
		onSubmit: async ({ value, meta }) => {
			const { error: problemUpdate } = await localjudge
				.contest({ id })
				.problem({ problem: problemNumber })
				.patch(value.problem);
			if (problemUpdate) {
				toastManager.add({
					title: "Problem update failed",
					description: JSON.stringify(problemUpdate),
					type: "error",
				});
				return;
			}

			// simulate adding and removing testcases
			for (const operation of meta.testcasesDiff) {
				switch (operation.op) {
					case "+":
						await localjudge
							.contest({ id })
							.problem({ problem: problemNumber })
							.testcase.post(Value.Create(TestcaseModel.insert));
						break;
					case "-":
						await localjudge
							.contest({ id })
							.problem({ problem: problemNumber })
							.testcase({ testcase: operation.number })
							.delete();
						break;
				}
			}

			// update testcases
			const testcasesUpdate = await Promise.allSettled(
				value.testcases.map((testcase, i) =>
					rejectError(
						localjudge
							.contest({ id })
							.problem({ problem: problemNumber })
							.testcase({ testcase: i + 1 })
							.patch(testcase),
					),
				),
			);

			if (testcasesUpdate.map(({ status }) => status).includes("rejected")) {
				toastManager.add({
					title: "Testcases update failed",
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
