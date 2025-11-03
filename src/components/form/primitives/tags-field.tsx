import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
	ComboboxValue,
} from "@/components/ui/combobox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

interface TagsFieldProps {
	label?: string;
	description?: string;
	placeholder?: string;
	items: string[];
}

export function TagsField({
	label,
	items,
	description,
	placeholder,
}: TagsFieldProps) {
	const field = useFieldContext<string[]>();
	return (
		<Field>
			{label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
			<Combobox
				items={items}
				multiple
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value)}
			>
				<ComboboxChips>
					<ComboboxValue>
						{(value: TagsFieldProps["items"]) => (
							<>
								{value.map((item) => (
									<ComboboxChip key={item} aria-label={item}>
										{item}
									</ComboboxChip>
								))}
								<ComboboxInput
									onBlur={field.handleBlur}
									placeholder={value.length > 0 ? undefined : placeholder}
									aria-label={placeholder}
								/>
							</>
						)}
					</ComboboxValue>
				</ComboboxChips>
				<ComboboxPopup>
					<ComboboxEmpty>No results found.</ComboboxEmpty>
					<ComboboxList>
						{(item: TagsFieldProps["items"][number]) => (
							<ComboboxItem value={item}>{item}</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxPopup>
			</Combobox>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldInfo field={field} />
		</Field>
	);
}
