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
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
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
		<Field
			name={field.name}
			invalid={!field.state.meta.isValid}
			dirty={field.state.meta.isDirty}
			touched={field.state.meta.isTouched}
		>
			{label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
			<Combobox
				items={items}
				multiple
				value={field.state.value}
				onValueChange={field.handleChange}
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
			<FieldError match={!field.state.meta.isValid}>
				{field.state.meta.errors.map(({ message }) => message).join(",")}
			</FieldError>
		</Field>
	);
}
