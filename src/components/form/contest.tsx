import { Value } from "@sinclair/typebox/value";
import { Compile } from "@sinclair/typemap";
import { formOptions } from "@tanstack/react-form";
import { useBlocker } from "@tanstack/react-router";
import { LucideSave } from "lucide-react";
import useSWR from "swr";
import { $localjudge } from "@/api/fetch";
import { withForm } from "@/components/form/primitives";
import { ContestModel } from "@/db/typebox/contest";
import { rejectError } from "@/lib/utils";

const defaultValues = Value.Default(
	ContestModel.insert,
	{},
) as typeof ContestModel.insert.static;

export const ContestFormOptions = formOptions({
	defaultValues,
	validators: {
		onChange: Compile(ContestModel.insert),
	},
});

export const ContestForm = withForm({
	...ContestFormOptions,
	render: function Render({ form }) {
		const { data: languages } = useSWR(
			"/api/piston/runtimes",
			(url) =>
				rejectError($localjudge(url, {})).then((data) =>
					data.map(({ language, version }) => `${language}@${version}`),
				),
			{
				suspense: true,
				fallbackData: [],
			},
		);

		useBlocker({
			shouldBlockFn: () => {
				if (!form.state.isDirty) return false;
				const shouldLeave = confirm("Are you sure you want to leave?");
				return !shouldLeave;
			},
		});

		return (
			<div className="grid gap-6">
				<form.AppField name="name">
					{(field) => (
						<field.TextField
							label="Name"
							placeholder="DSA - Practice Round 2"
						/>
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
							ContestModel.settings.properties.leaderboard;
						return (
							<field.ToggleSwitch label={title} description={description} />
						);
					}}
				</form.AppField>
				<form.AppField name="settings.submissions.limit">
					{(field) => {
						const { title, description } =
							ContestModel.settings.properties.submissions.properties.limit;
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
							ContestModel.settings.properties.submissions.properties.visible;
						return (
							<field.ToggleSwitch label={title} description={description} />
						);
					}}
				</form.AppField>
				<form.AppField name="settings.languages">
					{(field) => {
						const { title, description } =
							ContestModel.settings.properties.languages;
						return (
							<field.MultiselectField
								key={languages.length}
								label={title}
								description={description}
								placeholder="Select languages"
								defaultOptions={languages}
								hidePlaceholderWhenSelected
							/>
						);
					}}
				</form.AppField>
				<form.AppForm>
					<form.SubmitButton>
						Save <LucideSave />
					</form.SubmitButton>
				</form.AppForm>
			</div>
		);
	},
});
