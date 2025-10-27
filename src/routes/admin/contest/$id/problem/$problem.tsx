import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { t } from "elysia";
import { toast } from "sonner";
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
			const { error } = await localjudge
				.contest({ id })
				.problem({ problem: problemNumber })
				.patch(value.problem);
			if (error) {
				toast.error("Failed to update problem", {
					description: JSON.stringify(error),
				});
				return;
			}
			const { error: error2 } = await localjudge
				.contest({ id })
				.problem({ problem: problemNumber })
				.testcase.put(value.testcases);
			if (error2) {
				toast.error("Failed to update testcases", {
					description: JSON.stringify(error),
				});
				return;
			}
			toast.success("Problem and testcases updated successfully");
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
