import { Value } from "@sinclair/typebox/value";
import { LucideSave } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { ProblemModel } from "@/api/contest/problem/model";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Label } from "../ui/label";
import { withForm } from "./primitives";
import {
	TestcasesFieldGroup,
	TestcasesFieldGroupOptions,
} from "./testcases-group";

type TestcaseDiff = { op: "+" } | { op: "-"; number: number };

export const ProblemFormOptions = {
	defaultValues: {
		...TestcasesFieldGroupOptions.defaultValues,
		problem: Value.Cast(
			ProblemModel.insert,
			Value.Default(ProblemModel.insert, Value.Create(ProblemModel.insert)),
		),
	},
	onSubmitMeta: {
		testcasesDiff: [] as TestcaseDiff[],
	},
};

export const ProblemForm = withForm({
	...ProblemFormOptions,
	render: function Render({ form }) {
		const [testcasesDiff, setTestcasesDiff] = useState<TestcaseDiff[]>([]);
		return (
			<FieldSet>
				<FieldLegend>Problem Details</FieldLegend>
				<form.AppField name="problem.title">
					{(field) => <field.TextField label="Title" />}
				</form.AppField>
				<form.AppField name="problem.description">
					{(field) => (
						<div className="grid grid-cols-2 gap-2">
							<field.Textarea label="Description" />
							<div>
								<Label>Preview</Label>
								<Streamdown>{field.state.value}</Streamdown>
							</div>
						</div>
					)}
				</form.AppField>
				<div className="grid grid-cols-2 gap-4">
					<form.AppField name="problem.timeLimit">
						{(field) => {
							const { title, description } =
								ProblemModel.insert.properties.timeLimit;
							return (
								<field.NumberField label={title} description={description} />
							);
						}}
					</form.AppField>
					<form.AppField name="problem.memoryLimit">
						{(field) => {
							const { title, description } =
								ProblemModel.insert.properties.memoryLimit;
							return (
								<field.NumberField label={title} description={description} />
							);
						}}
					</form.AppField>
				</div>
				<Separator />
				<FieldSet>
					<FieldLegend>Testcases</FieldLegend>
					<TestcasesFieldGroup
						form={form}
						fields={{ testcases: "testcases" }}
						onAdd={() => {
							setTestcasesDiff((prev) => [...prev, { op: "+" }]);
						}}
						onDelete={(i) => {
							setTestcasesDiff((prev) => [...prev, { op: "-", number: i + 1 }]);
						}}
					/>
				</FieldSet>
				<Separator />
				<form.AppForm>
					<form.SubmitButton
						onClick={() => form.handleSubmit({ testcasesDiff })}
					>
						Save <LucideSave />
					</form.SubmitButton>
				</form.AppForm>
			</FieldSet>
		);
	},
});
