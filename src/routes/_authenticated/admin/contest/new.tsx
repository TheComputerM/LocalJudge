import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { localjudge } from "@/api/client";
import { ContestModel } from "@/api/contest/model";
import { ContestForm, ContestFormOptions } from "@/components/form/contest";
import { useAppForm } from "@/components/form/primitives";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_authenticated/admin/contest/new")({
	component: RouteComponent,
});

function NewContestForm() {
	const navigate = Route.useNavigate();

	const form = useAppForm({
		...ContestFormOptions,
		onSubmit: async ({ value }) => {
			const contestData = Value.Parse(ContestModel.insert, value);
			const { data, error } = await localjudge.contest.post(contestData);
			if (error) {
				alert(JSON.stringify(error));
				return;
			}
			navigate({ to: "/admin/contest/$id", params: { id: data.id } });
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
