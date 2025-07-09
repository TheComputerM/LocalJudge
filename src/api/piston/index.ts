import { semver } from "bun";
import Elysia, { t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { $piston } from "@/api/piston/client";
import { rejectError } from "@/lib/utils";

/**
 * Piston is the underlying code sandbox and execution engine
 */
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
	.get("/runtimes", async () => rejectError($piston("@get/runtimes")))
	.get("/packages", async () => {
		const packages = await rejectError($piston("@get/packages"));
		packages.sort(
			(a, b) =>
				a.language.localeCompare(b.language) ||
				semver.order(a.language_version, b.language_version),
		);
		return packages;
	})
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
					rejectError($piston("@post/packages", { body })),
				)
				.delete("/packages", async ({ body }) =>
					rejectError($piston("@delete/packages", { body })),
				),
	);
