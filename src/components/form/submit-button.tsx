import { LucideLoader } from "lucide-react";
import { Button } from "../ui/button";
import { useFormContext } from "./form-context";

export function SubmitButton({
	children,
	...props
}: React.ComponentProps<typeof Button>) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting} {...props}>
					{isSubmitting && <LucideLoader className="animate-spin" />}
					{children}
				</Button>
			)}
		</form.Subscribe>
	);
}
