import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

interface TextFieldProps extends React.ComponentProps<"input"> {
	label?: string;
	description?: string;
}

export function TextField({ label, description, ...props }: TextFieldProps) {
	const field = useFieldContext<string>();

	return (
		<Field>
			{label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				{...props}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldInfo field={field} />
		</Field>
	);
}
