import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
		<div className="flex flex-col gap-3">
			{label && <Label htmlFor={field.name}>{label}</Label>}
			<Input
				id={field.name}
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(Number.parseInt(e.target.value))}
				type="number"
				{...props}
			/>
			{description && (
				<p className="text-muted-foreground text-xs">{description}</p>
			)}
			<FieldInfo field={field} />
		</div>
	);
}
