import type { AnyFieldApi } from "@tanstack/react-form";
import { FieldError } from "@/components/ui/field";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
	if (field.state.meta.errors.length === 0) {
		return null;
	}

	return (
		<FieldError>
			{field.state.meta.isTouched &&
				field.state.meta.errors.map((error, i) => (
					<p key={i}>{error.message}</p>
				))}
		</FieldError>
	);
}
