import { LucidePlus, LucideSave, LucideTrash } from "lucide-react";
import { ProblemModel } from "@/api/models/problem";
import { TestcaseModel } from "@/api/models/testcase";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfirmActionDialog } from "../confirm-action";
import { withForm } from "./primitives";

const defaultValues = {} as {
	problem: typeof ProblemModel.insert.static;
	testcases: typeof TestcaseModel.Group.insert.static;
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
				<Separator />

				<form.AppField name="testcases" mode="array">
					{(field) => (
						<div className="grid gap-4">
							<div className="flex items-center justify-between mb-2">
								<span className="scroll-m-20 text-2xl font-semibold tracking-tight">
									Testcases
								</span>
								<Button
									type="button"
									onClick={() => {
										field.pushValue({
											number: field.state.value.length + 1,
											input: "hello world",
											output: "hello world",
											hidden: false,
										});
									}}
								>
									Add
									<LucidePlus />
								</Button>
							</div>
							{field.state.value.map((tc, i) => (
								<Card key={i} className="gap-4 py-4">
									<CardHeader className="flex items-center justify-between px-4">
										<CardTitle>Testcase {i + 1}</CardTitle>
										<ConfirmActionDialog onConfirm={() => field.removeValue(i)}>
											<Button type="button" variant="destructive" size="sm">
												Delete
												<LucideTrash />
											</Button>
										</ConfirmActionDialog>
									</CardHeader>
									<CardContent className="grid grid-cols-2 gap-4 px-4">
										<form.AppField name={`testcases[${i}].input`}>
											{(field) => <field.Textarea label="Input" />}
										</form.AppField>
										<form.AppField name={`testcases[${i}].output`}>
											{(field) => <field.Textarea label="Output" />}
										</form.AppField>
									</CardContent>
									<CardFooter className="px-4"></CardFooter>
								</Card>
							))}
						</div>
					)}
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
