import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const THEME_KEY = "ui-mode";

export const getThemeFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return getCookie(THEME_KEY) || "light";
	},
);

export const setThemeFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => {
		if (typeof data !== "string" || (data !== "dark" && data !== "light")) {
			throw new Error("Invalid theme provided");
		}
		return data;
	})
	.handler(async ({ data }) => {
		setCookie(THEME_KEY, data);
	});
