import { createFormHook } from "@tanstack/react-form";
import { DateTimePicker } from "./date-time-picker";
import { fieldContext, formContext } from "./form-context";
import { NumberField } from "./number-field";
import { TextField } from "./text-field";
import { ToggleSwitch } from "./toggle-switch";

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
		NumberField,
		DateTimePicker,
		ToggleSwitch,
	},
	formComponents: {},
});
