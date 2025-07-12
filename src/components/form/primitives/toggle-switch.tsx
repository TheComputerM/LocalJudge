import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

export function ToggleSwitch({
	label,
	description,
	border = true,
}: {
	label?: string;
	description?: string;
	border?: boolean;
}) {
	const field = useFieldContext<boolean>();

	return (
		<div
			className={cn(
				"relative flex w-full items-center gap-2 rounded-md p-4 outline-none",
				border &&
					"border-input has-data-[state=checked]:border-primary/50 border shadow-xs",
			)}
		>
			<div className="grid grow gap-2">
				<Label htmlFor={field.name}>{label}</Label>
				{description && (
					<p
						id={`${field.name}-description`}
						className="text-muted-foreground text-xs"
					>
						{description}
					</p>
				)}
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
