import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "elysia";
import { localjudge } from "@/api/client";
import { ProblemModel } from "@/api/contest/problem/model";
import { TestcaseModel } from "@/api/contest/problem/testcase/model";
import { useAppForm } from "@/components/form/primitives";
import { ProblemForm, ProblemFormOptions } from "@/components/form/problem";
import { toastManager } from "@/components/ui/toast";

export const Route = createFileRoute(
	"/_authenticated/admin/contest/$id/problem/new",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const contestId = Route.useParams({ select: (data) => data.id });
	const form = useAppForm({
		...ProblemFormOptions,
		defaultValues: {
			problem: Value.Cast(
				ProblemModel.insert,
				Value.Default(ProblemModel.insert, {}),
			),
			testcases: Value.Cast(t.Array(TestcaseModel.insert), []),
		},
		onSubmit: async ({ value }) => {
			const { data, error: createProblem } = await localjudge
				.contest({ id: contestId })
				.problem.post(value.problem);
			if (createProblem) {
				toastManager.add({
					title: "Problem create failed",
					description: JSON.stringify(createProblem),
					type: "error",
				});
				return;
			}
			for (const testcase of value.testcases) {
				const { error: createTestcase } = await localjudge
					.contest({ id: contestId })
					.problem({ problem: data.number })
					.testcase.post(testcase);
				if (createTestcase) {
					toastManager.add({
						title: "Testcases create failed",
						description: JSON.stringify(createTestcase),
						type: "error",
					});
					return;
				}
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
