import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { ContestForm, ContestFormOptions } from "@/components/form/contest";
import { useAppForm } from "@/components/form/primitives";
import { ContestModel } from "@/db/typebox/contest";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/$id/")({
	loader: async ({ params }) => {
		const contest = await rejectError(
			localjudge.api.contest({ id: params.id }).get(),
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
		<div>
			{/* @ts-expect-error: Some tanstack form stuff ig */}
			<ContestForm form={form} languages={[""]} label="Update Contest" />
		</div>
	);
}
