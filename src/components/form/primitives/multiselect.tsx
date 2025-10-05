import { CheckIcon } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
	Tags,
	TagsContent,
	TagsEmpty,
	TagsGroup,
	TagsInput,
	TagsItem,
	TagsList,
	TagsTrigger,
	TagsValue,
} from "@/components/ui/kibo-ui/tags";
import { Label } from "@/components/ui/label";
import { FieldInfo } from "./field-info";
import { useFieldContext } from "./form-context";

interface MultiselectFieldProps {
	label?: string;
	description?: string;
	placeholder?: string;
	options: string[];
}

export function MultiselectField({
	label,
	description,
	placeholder,
	options,
}: MultiselectFieldProps) {
	const field = useFieldContext<string[]>();

	const handleRemove = (value: string) => {
		if (!field.state.value.includes(value)) return;

		field.handleChange(field.state.value.filter((v) => v !== value));
	};

	const handleSelect = (value: string) => {
		if (field.state.value.includes(value)) {
			handleRemove(value);
			return;
		}
		field.handleChange([...field.state.value, value]);
	};

	return (
		<Field>
			{label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
			<Tags>
				<TagsTrigger onBlur={field.handleBlur} placeholder={placeholder}>
					{field.state.value.map((tag) => (
						<TagsValue key={tag} onRemove={() => handleRemove(tag)}>
							{tag}
						</TagsValue>
					))}
				</TagsTrigger>
				<TagsContent>
					<TagsInput placeholder={placeholder} />
					<TagsList>
						<TagsEmpty />
						<TagsGroup>
							{options.map((tag) => (
								<TagsItem key={tag} value={tag} onSelect={handleSelect}>
									{tag}
									{field.state.value.includes(tag) && (
										<CheckIcon className="text-muted-foreground" size={14} />
									)}
								</TagsItem>
							))}
						</TagsGroup>
					</TagsList>
				</TagsContent>
			</Tags>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldInfo field={field} />
		</Field>
	);
}
