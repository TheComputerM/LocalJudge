import { Value } from "@sinclair/typebox/value";
import { Zod } from "@sinclair/typemap";
import { createFileRoute } from "@tanstack/react-router";
import { useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	contestInsertSchema,
	contestSettingsSchema,
} from "@/db/typebox/contest";

export const Route = createFileRoute("/admin/contest/new")({
	component: RouteComponent,
});

function NewContestForm() {
	const form = useAppForm({
		defaultValues: Value.Default(contestInsertSchema, {}),
		validators: {
			// TODO: https://github.com/sinclairzx81/typemap/issues/35
			onChange: Zod(contestInsertSchema),
		},
		onSubmit: ({ value }) => {
			const result = Value.Parse(contestInsertSchema, value);
			console.log(result);
		},
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
			<form.AppField name="name">
				{(field) => (
					<field.TextField label="Name" placeholder="DSA - Practice Round 2" />
				)}
			</form.AppField>
			<div className="grid sm:grid-cols-2 gap-6">
				<form.AppField name="startTime">
					{(field) => <field.DateTimePicker label="Start time" />}
				</form.AppField>
				<form.AppField name="endTime">
					{(field) => <field.DateTimePicker label="End time" />}
				</form.AppField>
			</div>
			<form.AppField name="settings.leaderboard">
				{(field) => {
					const { title, description } =
						contestSettingsSchema.properties.leaderboard;
					return <field.ToggleSwitch label={title} description={description} />;
				}}
			</form.AppField>
			<form.AppField name="settings.submissions.limit">
				{(field) => {
					const { title, description } =
						contestSettingsSchema.properties.submissions.properties.limit;
					return (
						<field.NumberField
							label={title}
							description={description}
							min={0}
						/>
					);
				}}
			</form.AppField>
			<form.AppField name="settings.submissions.visible">
				{(field) => {
					const { title, description } =
						contestSettingsSchema.properties.submissions.properties.visible;
					return <field.ToggleSwitch label={title} description={description} />;
				}}
			</form.AppField>
			<Button type="submit">Submit</Button>
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
