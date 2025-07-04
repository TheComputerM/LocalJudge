import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { useAppForm } from "@/components/form";
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

function ProblemForm() {
	const problem = Route.useLoaderData();
	const form = useAppForm({
		defaultValues: { problem },
	});

	return (
		<form
			className="grid gap-6"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<form.AppField name="problem.title">
				{(field) => <field.TextField label="Title" />}
			</form.AppField>
			<form.Field name="problem.description">
				{(field) => (
					<textarea
						value={field.state.value}
						onChange={(e) => field.handleChange(e.target.value)}
						onBlur={field.handleBlur}
					/>
				)}
			</form.Field>
		</form>
	);
}

function RouteComponent() {
	return (
		<div>
			<ProblemForm />
		</div>
	);
}
