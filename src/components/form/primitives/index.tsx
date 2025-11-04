import { createFormHook } from "@tanstack/react-form";
import { DateTimePicker } from "./date-time-picker";
import { fieldContext, formContext } from "./form-context";
import { NumberField } from "./number-field";
import { SubmitButton } from "./submit-button";
import { TagsField } from "./tags-field";
import { TextField } from "./text-field";
import { Textarea } from "./textarea";
import { ToggleSwitch } from "./toggle-switch";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		NumberField,
		DateTimePicker,
		ToggleSwitch,
		TagsField,
		Textarea,
	},
	formComponents: {
		SubmitButton,
	},
});
