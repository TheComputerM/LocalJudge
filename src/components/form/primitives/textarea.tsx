import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Textarea as BaseTextarea } from "@/components/ui/textarea";
import { useFieldContext } from "./form-context";

interface TextareaProps extends React.ComponentProps<"textarea"> {
	label?: string;
	description?: string;
}

export function Textarea({ label, description, ...props }: TextareaProps) {
	const field = useFieldContext<string>();

	return (
		<Field
			name={field.name}
			invalid={!field.state.meta.isValid}
			dirty={field.state.meta.isDirty}
			touched={field.state.meta.isTouched}
		>
			{label && <FieldLabel>{label}</FieldLabel>}
			<BaseTextarea
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				{...props}
			/>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldError match={!field.state.meta.isValid}>
				{field.state.meta.errors.map(({ message }) => message).join(",")}
			</FieldError>
		</Field>
	);
}
