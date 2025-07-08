import { ProblemModel } from "@/db/typebox/problem";
import { TestcaseModel } from "@/db/typebox/testcase";
import { withForm } from "./primitives";

const defaultValues = {} as {
	problem: typeof ProblemModel.insert.static;
	testcases: Array<typeof TestcaseModel.insert.static>;
};

export const ProblemForm = withForm({
	defaultValues,
	render: function Render({ form }) {
		return (
			<div className="grid gap-6">
				<form.AppField name="problem.title">
					{(field) => <field.TextField label="Title" />}
				</form.AppField>
				<form.AppField name="problem.description">
					{(field) => <field.Textarea label="Description" />}
				</form.AppField>
				<form.AppForm>
					<form.SubmitButton>Save</form.SubmitButton>
				</form.AppForm>
			</div>
		);
	},
});
