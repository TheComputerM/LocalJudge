import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

interface TextFieldProps extends React.ComponentProps<"input"> {
	label?: string;
	description?: string;
}

export function TextField({ label, description, ...props }: TextFieldProps) {
	const field = useFieldContext<string>();

	return (
		<div className="flex flex-col gap-3">
			{label && <Label htmlFor={field.name}>{label}</Label>}
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
				{...props}
			/>
			{description && (
				<p className="text-muted-foreground text-xs">{description}</p>
			)}
			<FieldInfo field={field} />
		</div>
	);
}
