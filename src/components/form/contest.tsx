import { Value } from "@sinclair/typebox/value";
import { Compile } from "@sinclair/typemap";
import { formOptions } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useBlocker } from "@tanstack/react-router";
import { addHours, addMinutes } from "date-fns";
import { LucideSave } from "lucide-react";
import { ContestModel } from "@/api/contest/model";
import { $localjudge } from "@/api/fetch";
import { withForm } from "@/components/form/primitives";
import {
	FieldDescription,
	FieldGroup,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { rejectError } from "@/lib/utils";

const startTime = addMinutes(new Date(), 5);
const defaultValues = {
	...Value.Create(ContestModel.insert),
	name: "",
	startTime: startTime,
	endTime: addHours(startTime, 2),
};

export const ContestFormOptions = formOptions({
	defaultValues,
	validators: {
		onChange: Compile(ContestModel.insert),
	},
});

export const ContestForm = withForm({
	...ContestFormOptions,
	render: function Render({ form }) {
		const { data: languages } = useSuspenseQuery({
			queryKey: ["/api/localbox/engine"] as const,
			queryFn: async ({ queryKey: [url] }) =>
				rejectError($localjudge(url, {})).then((data) =>
					Object.entries(data)
						.filter(([, { installed }]) => installed)
						.map(([language]) => language),
				),
			initialData: [],
		});

		useBlocker({
			shouldBlockFn: () => {
				if (form.state.isPristine) return false;
				const shouldLeave = confirm("Are you sure you want to leave?");
				return !shouldLeave;
			},
		});

		return (
			<FieldGroup>
				<FieldSet>
					<FieldLegend>Contest Details</FieldLegend>
					<FieldDescription>
						Provide details about the contest.
					</FieldDescription>
					<form.AppField name="name">
						{(field) => (
							<field.TextField
								label="Name"
								placeholder="DSA - Practice Round 2"
							/>
						)}
					</form.AppField>
					<div className="grid sm:grid-cols-2 gap-4">
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
					<form.AppField name="settings.languages">
						{(field) => {
							const { title, description } =
								ContestModel.settings.properties.languages;
							return (
								<field.MultiselectField
									label={title}
									description={description}
									placeholder="Select languages"
									options={languages}
								/>
							);
						}}
					</form.AppField>
				</FieldSet>
				<FieldSeparator />
				<FieldSet>
					<form.AppField name="settings.submissions_limit">
						{(field) => {
							const { title, description } =
								ContestModel.settings.properties.submissions_limit;
							return (
								<field.NumberField
									label={title}
									description={description}
									min={0}
								/>
							);
						}}
					</form.AppField>
					<form.AppField name="settings.visible_results">
						{(field) => {
							const { title, description } =
								ContestModel.settings.properties.visible_results;
							return (
								<field.ToggleSwitch label={title} description={description} />
							);
						}}
					</form.AppField>
				</FieldSet>
				<FieldSeparator />
				<form.AppForm>
					<form.SubmitButton>
						Save <LucideSave />
					</form.SubmitButton>
				</form.AppForm>
			</FieldGroup>
		);
	},
});
