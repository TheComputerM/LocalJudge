import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { localjudge } from "@/api/client";
import { ContestModel } from "@/api/contest/model";
import { ContestForm, ContestFormOptions } from "@/components/form/contest";
import { useAppForm } from "@/components/form/primitives";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/contest/new")({
	component: RouteComponent,
});

function NewContestForm() {
	const navigate = Route.useNavigate();

	const form = useAppForm({
		...ContestFormOptions,
		onSubmit: async ({ value }) => {
			const contestData = Value.Parse(ContestModel.insert, value);
			toastManager.promise(
				rejectError(localjudge.contest.post(contestData)).then(({ id }) => {
					navigate({
						to: "/admin/contest/$id",
						params: { id },
						ignoreBlocker: true,
					});
				}),
				{
					loading: "Creating contest...",
					success: "Contest created",
					error: (error) => ({
						title: "Contest create failed",
						description: JSON.stringify(error),
					}),
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
			<Suspense
				fallback={
					<div className="h-svh flex items-center justify-center">
						<Spinner />
					</div>
				}
			>
				<ContestForm form={form} />
			</Suspense>
		</form>
	);
}

function RouteComponent() {
	return (
		<div>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Create New Contest
			</h1>
			<Separator className="my-8" />
			<NewContestForm />
		</div>
	);
}
