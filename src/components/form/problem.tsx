import { Value } from "@sinclair/typebox/value";
import { LucideSave } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { ProblemModel } from "@/api/contest/problem/model";
import { Fieldset, FieldsetLegend } from "@/components/ui/fieldset";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
			<div className="flex flex-col gap-6">
				<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
					Problem Details
				</h3>
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
				<h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
					Testcases
				</h4>
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
				<Separator />
				<form.AppForm>
					<form.SubmitButton
						onClick={() => form.handleSubmit({ testcasesDiff })}
					>
						Save <LucideSave />
					</form.SubmitButton>
				</form.AppForm>
			</div>
		);
	},
});
