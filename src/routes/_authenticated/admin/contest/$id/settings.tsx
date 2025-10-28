import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { localjudge } from "@/api/client";
import { ContestModel } from "@/api/contest/model";
import { ContestForm, ContestFormOptions } from "@/components/form/contest";
import { useAppForm } from "@/components/form/primitives";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute(
	"/_authenticated/admin/contest/$id/settings",
)({
	loader: async ({ params, abortController }) => {
		const contest = await rejectError(
			localjudge.contest({ id: params.id }).get({
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
			const response = await localjudge
				.contest({ id: contest.id })
				.patch(value);
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
			<Suspense fallback={<div>Loading...</div>}>
				<ContestForm form={form} />
			</Suspense>
		</form>
	);
}
