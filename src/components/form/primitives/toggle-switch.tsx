import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

export function ToggleSwitch({
	label,
	description,
}: {
	label?: string;
	description?: string;
}) {
	const field = useFieldContext<boolean>();

	return (
		<div
			className={cn(
				"relative flex w-full items-center gap-2 rounded-md p-4 outline-none border-input has-data-[state=checked]:border-primary/50 border shadow-xs",
			)}
		>
			<Field orientation="horizontal">
				<FieldContent>
					<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
					{description && (
						<FieldDescription id={`${field.name}-description`}>
							{description}
						</FieldDescription>
					)}
					<FieldInfo field={field} />
				</FieldContent>
				<Switch
					id={field.name}
					aria-describedby={`${field.name}-description`}
					checked={field.state.value}
					onCheckedChange={field.handleChange}
					onBlur={field.handleBlur}
				/>
			</Field>
		</div>
	);
}
