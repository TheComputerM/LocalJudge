import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "./form-context";

interface TextFieldProps extends React.ComponentProps<"input"> {
	label?: string;
	description?: string;
}

export function TextField({ label, description, ...props }: TextFieldProps) {
	const field = useFieldContext<string>();

	return (
		<Field
			name={field.name}
			invalid={!field.state.meta.isValid}
			dirty={field.state.meta.isDirty}
			touched={field.state.meta.isTouched}
		>
			{label && <FieldLabel>{label}</FieldLabel>}
			<Input
				value={field.state.value}
				onBlur={field.handleBlur}
				onValueChange={field.handleChange}
				{...props}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldError match={!field.state.meta.isValid}>
				{field.state.meta.errors.map(({ message }) => message).join(",")}
			</FieldError>
		</Field>
	);
}
