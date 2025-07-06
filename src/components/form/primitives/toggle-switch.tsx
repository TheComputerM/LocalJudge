import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

export function ToggleSwitch(props: { label?: string; description?: string }) {
	const field = useFieldContext<boolean>();

	return (
		<div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
			<div className="grid grow gap-2">
				<Label htmlFor={field.name}>{props.label}</Label>
				<p
					id={`${field.name}-description`}
					className="text-muted-foreground text-xs"
				>
					{props.description}
				</p>
				<FieldInfo field={field} />
			</div>
			<Switch
				id={field.name}
				aria-describedby={`${field.name}-description`}
				checked={field.state.value}
				onCheckedChange={field.handleChange}
				onBlur={field.handleBlur}
			/>
		</div>
	);
}
