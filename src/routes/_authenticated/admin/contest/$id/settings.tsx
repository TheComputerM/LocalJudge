import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { localjudge } from "@/api/client";
import { ContestModel } from "@/api/contest/model";
import { ContestForm, ContestFormOptions } from "@/components/form/contest";
import { useAppForm } from "@/components/form/primitives";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
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
			toastManager.promise(
				rejectError(localjudge.contest({ id: contest.id }).patch(value)),
				{
					loading: "Updating contest settings...",
					success: "Contest updated",
					error: "Contest update failed",
				},
			);
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
			<Suspense fallback={<Spinner className="mx-auto" />}>
				<ContestForm form={form} />
			</Suspense>
		</form>
	);
}
