import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { useAppForm } from "@/components/form/primitives";
import { ProblemForm } from "@/components/form/problem";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/$id/problem/$problem")({
	loader: async ({ params }) => {
		const problem = await rejectError(
			localjudge.api.admin
				.contest({ id: params.id })
				.problem({ problem: params.problem })
				.get(),
		);
		return problem;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const problem = Route.useLoaderData();
	const form = useAppForm({
		defaultValues: {
			problem,
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
