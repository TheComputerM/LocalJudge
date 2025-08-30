import { LucidePlus, LucideSave, LucideTrash } from "lucide-react";
import { ProblemModel } from "@/api/models/problem";
import { TestcaseModel } from "@/api/models/testcase";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmActionDialog } from "../confirm-action";
import { withForm } from "./primitives";

const defaultValues = {} as {
	problem: typeof ProblemModel.insert.static;
	testcases: (typeof TestcaseModel.upsert.static)[];
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
				<div className="grid grid-cols-2 gap-6">
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
				<form.AppField name="testcases" mode="array">
					{(field) => (
						<>
							<span className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">
								Testcases
							</span>
							<Tabs
								orientation="vertical"
								className="w-full flex-row gap-4"
								defaultValue="0"
							>
								<div className="flex flex-col items-center gap-3">
									<TabsList className="flex-col h-auto">
										{field.state.value.map((_, i) => (
											<TabsTrigger
												key={i}
												value={i.toString()}
												className="w-full"
											>
												Case {i + 1}
											</TabsTrigger>
										))}
									</TabsList>
									<Button
										size="sm"
										type="button"
										onClick={() => {
											field.pushValue({
												number: field.state.value.length + 1,
												input: "stdin",
												output: "stdout",
												hidden: false,
												points: 25,
											});
										}}
									>
										Add
										<LucidePlus />
									</Button>
								</div>
								<div className="grow p-4 rounded-md border">
									{field.state.value.map((_, i) => (
										<TabsContent
											key={i}
											value={i.toString()}
											className="grid gap-6"
										>
											<div className="grid grid-cols-2 gap-6">
												<form.AppField name={`testcases[${i}].input`}>
													{(field) => <field.Textarea label="Input" />}
												</form.AppField>
												<form.AppField name={`testcases[${i}].output`}>
													{(field) => <field.Textarea label="Expected" />}
												</form.AppField>
											</div>
											<form.AppField name={`testcases[${i}].points`}>
												{(field) => (
													<field.NumberField
														label="Points"
														description="Points awarded if this testcase is passed"
													/>
												)}
											</form.AppField>
											<form.AppField name={`testcases[${i}].hidden`}>
												{(field) => (
													<field.ToggleSwitch
														label="Hidden"
														description="Testcase will be hidden from the participants"
													/>
												)}
											</form.AppField>
											<ConfirmActionDialog
												onConfirm={() => field.removeValue(i)}
											>
												<Button
													type="button"
													variant="destructive"
													size="sm"
													className="justify-self-end"
												>
													Delete
													<LucideTrash />
												</Button>
											</ConfirmActionDialog>
										</TabsContent>
									))}
								</div>
							</Tabs>
						</>
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
