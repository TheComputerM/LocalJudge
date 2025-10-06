import Elysia, { t } from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { $localbox } from "@/api/localbox/client";
import { LocalboxSchema } from "./schema";

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
	.get("/engine", async () => $localbox("@get/engine"), {
		detail: { summary: "List Engines" },
	})
	.group(
		"/engine/:engine",
		{ params: t.Object({ engine: t.String() }) },
		(app) =>
			app
				.get(
					"/",
					async ({ params }) => $localbox("@get/engine/:engine", { params }),
					{
						detail: { summary: "Get Engine Info" },
					},
				)
				.post(
					"/",
					async ({ params }) => $localbox("@post/engine/:engine", { params }),
					{
						detail: { summary: "Install Engine" },
					},
				)
				.delete(
					"/",
					async ({ params }) => $localbox("@delete/engine/:engine", { params }),
					{
						detail: { summary: "Uninstall Engine" },
					},
				)
				.post(
					"/execute",
					async ({ params, body }) =>
						$localbox("@post/engine/:engine/execute", { params, body }),

					{
						body: t.Object({
							files: t.Array(LocalboxSchema.File),
							options: LocalboxSchema.PhaseOptions,
						}),
						detail: { summary: "Execute Engine" },
					},
				),
	);
