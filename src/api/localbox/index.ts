import Elysia, { t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { $localbox, LocalboxExecuteSchema } from "@/api/localbox/client";
import { rejectError } from "@/lib/utils";

/**
 * LocalBox is the underlying code sandbox and execution engine
 */
export const localboxApp = new Elysia({
	prefix: "/localbox",
	detail: {
		tags: ["LocalBox"],
		externalDocs: {
			url: "https://localbox/docs",
			description: "LocalBox is the underlying code sandbox used for execution",
		},
	},
})
	.use(betterAuthPlugin)
	.guard({
		auth: "admin",
	})
	.get("/engine", async () => rejectError($localbox("@get/engine")), {
		detail: { summary: "List Engines" },
	})
	.group(
		"/engine/:engine",
		{ params: t.Object({ engine: t.String() }) },
		(app) =>
			app
				.get(
					"/",
					async ({ params }) =>
						rejectError($localbox("@get/engine/:engine", { params })),
					{
						detail: { summary: "Get Engine Info" },
					},
				)
				.post(
					"/",
					async ({ params }) =>
						rejectError($localbox("@post/engine/:engine", { params })),
					{
						detail: { summary: "Install Engine" },
					},
				)
				.delete(
					"/",
					async ({ params }) =>
						rejectError($localbox("@delete/engine/:engine", { params })),
					{
						detail: { summary: "Uninstall Engine" },
					},
				)
				.post(
					"/execute",
					async ({ params, body }) =>
						rejectError(
							$localbox("@post/engine/:engine/execute", { params, body }),
						),
					{
						body: LocalboxExecuteSchema,
						detail: { summary: "Execute Engine" },
					},
				),
	);
