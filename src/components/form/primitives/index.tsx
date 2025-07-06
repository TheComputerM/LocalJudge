import { createFormHook } from "@tanstack/react-form";
import { DateTimePicker } from "./date-time-picker";
import { fieldContext, formContext } from "./form-context";
import { MultiselectField } from "./multiselect";
import { NumberField } from "./number-field";
import { SubmitButton } from "./submit-button";
import { TextField } from "./text-field";
import { Textarea } from "./textarea";
import { ToggleSwitch } from "./toggle-switch";

export const { useAppForm, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		NumberField,
		DateTimePicker,
		ToggleSwitch,
		MultiselectField,
		Textarea,
	},
	formComponents: {
		SubmitButton,
	},
});
