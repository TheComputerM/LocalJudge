import { t } from "elysia";

export namespace ParticipantModel {
	export const insert = t.Object({
		name: t.String({ title: "Name", examples: ["John Doe"] }),
		email: t.String({
			title: "Email",
			format: "email",
			default: "",
			examples: ["a@example.com"],
		}),
		password: t.String({ title: "Password" }),
	});
}
