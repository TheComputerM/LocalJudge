import Elysia, { t } from "elysia";
import { piston } from "@/lib/piston";
import { rejectError } from "@/lib/utils";
import { betterAuthPlugin } from "./better-auth";

export const pistonApp = new Elysia({
	prefix: "/piston",
	detail: {
		tags: ["Piston"],
		externalDocs: {
			url: "https://piston.readthedocs.io/",
			description: "Piston is the underlying code sandbox used for execution",
		},
	},
})
	.use(betterAuthPlugin)
	.guard({
		auth: "admin",
	})
	.get("/runtimes", async () => rejectError(piston("@get/runtimes")))
	.get("/packages", async () => rejectError(piston("@get/packages")))
	.guard(
		{
			body: t.Object({
				language: t.String(),
				version: t.String(),
			}),
		},
		(app) =>
			app
				.post("/packages", async ({ body }) =>
					rejectError(piston("@post/packages", { body })),
				)
				.delete("/packages", async ({ body }) =>
					rejectError(piston("@delete/packages", { body })),
				),
	);
