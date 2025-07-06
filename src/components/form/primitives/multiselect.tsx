import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import MultipleSelector, {
	MultipleSelectorProps,
	Option,
} from "@/components/ui/multiselect";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

interface MultiselectFieldProps
	extends Omit<MultipleSelectorProps, "defaultOptions"> {
	label?: string;
	description?: string;
	defaultOptions?: string[];
}

export function MultiselectField({
	label,
	description,
	defaultOptions,
	...props
}: MultiselectFieldProps) {
	const field = useFieldContext<string[]>();
	const value: Option[] = useMemo(
		() => field.state.value.map((value) => ({ value, label: value })),
		[field.state.value],
	);

	return (
		<div className="flex flex-col gap-3">
			{label && <Label htmlFor={field.name}>{label}</Label>}
			<MultipleSelector
				value={value}
				defaultOptions={defaultOptions?.map((value) => ({
					value,
					label: value,
				}))}
				onChange={(options) =>
					field.handleChange(options.map(({ value }) => value))
				}
				{...props}
				commandProps={{ label }}
			/>
			{description && (
				<p className="text-muted-foreground text-xs">{description}</p>
			)}
			<FieldInfo field={field} />
		</div>
	);
}
