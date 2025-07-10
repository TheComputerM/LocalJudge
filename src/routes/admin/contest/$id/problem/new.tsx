import { createFileRoute } from "@tanstack/react-router";
import { useAppForm } from "@/components/form/primitives";
import { ProblemForm } from "@/components/form/problem";

export const Route = createFileRoute("/admin/contest/$id/problem/new")({
	component: RouteComponent,
});

function RouteComponent() {
	const form = useAppForm({
		defaultValues: {
			problem: {
				title: "",
				description: "",
			},
			testcases: [],
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
