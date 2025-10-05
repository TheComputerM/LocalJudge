import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea as BaseTextarea } from "@/components/ui/textarea";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

interface TextareaProps extends React.ComponentProps<"textarea"> {
	label?: string;
	description?: string;
}

export function Textarea({ label, description, ...props }: TextareaProps) {
	const field = useFieldContext<string>();

	return (
		<Field>
			{label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
			<BaseTextarea
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
