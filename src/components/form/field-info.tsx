import type { AnyFieldApi } from "@tanstack/react-form";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched &&
				field.state.meta.errors.map((error, i) => (
					<p key={i} className="text-destructive text-xs">
						{error.message}
					</p>
				))}
		</>
	);
}
