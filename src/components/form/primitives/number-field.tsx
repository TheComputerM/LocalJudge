import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import {
	NumberField as BaseNumberField,
	NumberFieldDecrement,
	NumberFieldGroup,
	NumberFieldIncrement,
	NumberFieldInput,
} from "@/components/ui/number-field";
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
		<Field
			name={field.name}
			invalid={!field.state.meta.isValid}
			dirty={field.state.meta.isDirty}
			touched={field.state.meta.isTouched}
		>
			{label && <FieldLabel>{label}</FieldLabel>}
			<BaseNumberField
				value={field.state.value}
				onValueChange={(v) => v !== null && field.handleChange(v)}
				onBlur={field.handleBlur}
			>
				<NumberFieldGroup>
					<NumberFieldDecrement />
					<NumberFieldInput {...props} />
					<NumberFieldIncrement />
				</NumberFieldGroup>
			</BaseNumberField>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldError match={!field.state.meta.isValid}>
				{field.state.meta.errors.map(({ message }) => message).join(",")}
			</FieldError>
		</Field>
	);
}
