import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { ContestForm, ContestFormOptions } from "@/components/form/contest";
import { useAppForm } from "@/components/form/primitives";
import { ContestModel } from "@/db/typebox/contest";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/$id/")({
	loader: async ({ params, abortController }) => {
		const contest = await rejectError(
			localjudge.api.contest({ id: params.id }).get({
				fetch: { signal: abortController.signal },
			}),
		);

		return { contest };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const contest = Route.useLoaderData({ select: (data) => data.contest });

	const form = useAppForm({
		...ContestFormOptions,
		defaultValues: Value.Parse(ContestModel.insert, contest),
		onSubmit: ({ value }) => {
			console.log(value);
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
			<ContestForm form={form} label="Update Contest" />
		</form>
	);
}
