import { Value } from "@sinclair/typebox/value";
import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { ContestForm, ContestFormOptions } from "@/components/form/contest";
import { useAppForm } from "@/components/form/primitives";
import { Separator } from "@/components/ui/separator";
import { ContestModel } from "@/db/typebox/contest";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/new")({
	loader: async ({ abortController }) => {
		const languages = await rejectError(
			localjudge.api.piston.runtimes.get({
				fetch: { signal: abortController.signal },
			}),
		).then((data) =>
			data.map(({ language, version }) => `${language}@${version}`),
		);

		return { languages };
	},
	component: RouteComponent,
});

function NewContestForm() {
	const navigate = Route.useNavigate();
	const languages = Route.useLoaderData({ select: (data) => data.languages });

	const defaultValues = Value.Default(ContestModel.insert, {
		settings: { languages },
	}) as typeof ContestModel.insert.static;

	const form = useAppForm({
		...ContestFormOptions,
		defaultValues,
		onSubmit: async ({ value }) => {
			const contestData = Value.Parse(ContestModel.insert, value);
			const { data, error } =
				await localjudge.api.admin.contest.post(contestData);
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
			<ContestForm form={form} label="Create Contest" />
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
