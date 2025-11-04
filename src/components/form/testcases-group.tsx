import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { LucideBugPlay, LucidePlus, LucideTrash } from "lucide-react";
import { useState } from "react";
import { TestcaseModel } from "@/api/contest/problem/testcase/model";
import { ConfirmActionDialog } from "../confirm-action";
import { Button } from "../ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "../ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { withFieldGroup } from "./primitives";

export const TestcasesFieldGroupOptions = {
	defaultValues: {
		testcases: Value.Create(Type.Array(TestcaseModel.insert)),
	},
};

export const TestcasesFieldGroup = withFieldGroup({
	...TestcasesFieldGroupOptions,
	props: {} as {
		onAdd?: () => void;
		onDelete?: (number: number) => void;
	},
	render: function Render({ group, onAdd, onDelete }) {
		const [active, setActive] = useState(0);
		return (
			<group.AppField name="testcases" mode="array">
				{(field) => (
					<Tabs
						orientation="vertical"
						className="w-full flex-row gap-4"
						value={active}
					>
						<div className="flex flex-col items-center gap-3">
							<TabsList className="flex-col h-auto">
								{field.state.value.map((_, i) => (
									<TabsTrigger
										key={i}
										value={i}
										className="w-full"
										onClick={() => setActive(i)}
									>
										Case {i + 1}
									</TabsTrigger>
								))}
							</TabsList>
							<Button
								size="sm"
								type="button"
								onClick={() => {
									field.pushValue(Value.Create(TestcaseModel.insert));
									onAdd?.();
									setActive(field.state.value.length - 1);
								}}
							>
								Add
								<LucidePlus />
							</Button>
						</div>
						<div className="grow p-4 rounded-md border border-dashed">
							{field.state.value.length === 0 && (
								<Empty>
									<EmptyHeader>
										<EmptyMedia variant="icon">
											<LucideBugPlay />
										</EmptyMedia>
										<EmptyTitle>No Testcases</EmptyTitle>
										<EmptyDescription>
											Testcases help evaluate the correctness of submissions.
											Click The "Add" button to create your first testcase.
										</EmptyDescription>
									</EmptyHeader>
								</Empty>
							)}
							{field.state.value.map((_, i) => (
								<TabsContent key={i} value={i} className="grid gap-6">
									<div className="grid grid-cols-2 gap-6">
										<group.AppField name={`testcases[${i}].input`}>
											{(field) => (
												<field.Textarea
													label="Input"
													placeholder="STDIN for the program"
												/>
											)}
										</group.AppField>
										<group.AppField name={`testcases[${i}].output`}>
											{(field) => (
												<field.Textarea
													label="Expected"
													placeholder="Expected STDOUT for the program"
												/>
											)}
										</group.AppField>
									</div>
									<group.AppField name={`testcases[${i}].hidden`}>
										{(field) => (
											<field.ToggleSwitch
												label="Hidden"
												description="Testcase will be hidden from the participants"
											/>
										)}
									</group.AppField>
									<ConfirmActionDialog
										onConfirm={async () => {
											setActive(Math.max(0, i - 1));
											field.removeValue(i);
											onDelete?.(i + 1);
										}}
										trigger={
											<Button
												type="button"
												variant="destructive"
												size="sm"
												className="justify-self-end"
											>
												Delete
												<LucideTrash />
											</Button>
										}
									/>
								</TabsContent>
							))}
						</div>
					</Tabs>
				)}
			</group.AppField>
		);
	},
});
