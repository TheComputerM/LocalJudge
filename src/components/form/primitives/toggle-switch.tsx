import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
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
		<Field
			name={field.name}
			invalid={!field.state.meta.isValid}
			dirty={field.state.meta.isDirty}
			touched={field.state.meta.isTouched}
			className="flex-row items-center justify-between gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-checked:border-primary/48 has-data-checked:bg-accent/50"
		>
			<div className="flex flex-col gap-2">
				<FieldLabel>{label}</FieldLabel>
				<FieldDescription>{description}</FieldDescription>
				<FieldError match={!field.state.meta.isValid}>
					{field.state.meta.errors.map(({ message }) => message).join(",")}
				</FieldError>
			</div>
			<Switch
				id={field.name}
				aria-describedby={`${field.name}-description`}
				checked={field.state.value}
				onCheckedChange={field.handleChange}
				onBlur={field.handleBlur}
			/>
		</Field>
	);
}
