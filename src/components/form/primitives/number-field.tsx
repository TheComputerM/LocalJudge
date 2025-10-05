import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

interface NumberFieldProps extends React.ComponentProps<"input"> {
	label?: string;
	description?: string;
}

export function NumberField({
	label,
	description,
	...props
}: NumberFieldProps) {
	const field = useFieldContext<number>();

	return (
		<Field>
			{label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(Number.parseInt(e.target.value))}
				type="number"
				{...props}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldInfo field={field} />
		</Field>
	);
}
