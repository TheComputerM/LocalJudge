import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { ContestModel } from "@/api/models/contest";
import { ContestForm, ContestFormOptions } from "@/components/form/contest";
import { useAppForm } from "@/components/form/primitives";
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
		onSubmit: async ({ value }) => {
			const response = await localjudge.api.admin
				.contest({ id: contest.id })
				.put(value);
			console.log(response);
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
			<ContestForm form={form} />
		</form>
	);
}
