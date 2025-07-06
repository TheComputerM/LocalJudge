import { Label } from "@/components/ui/label";
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
		<div className="flex flex-col gap-3">
			{label && <Label htmlFor={field.name}>{label}</Label>}
			<BaseTextarea
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
