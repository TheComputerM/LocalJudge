import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { betterAuthPlugin } from "./better-auth";
import { userApp } from "./user";

export const baseApp = new Elysia({ prefix: "/api" })
	.use(
		swagger({
			path: "/",
			documentation: {
				info: {
					title: "LocalJudge Documentation",
					version: "1.0.0",
				},
			},
		}),
	)
	.use(betterAuthPlugin)
	.use(userApp);

export type App = typeof baseApp;
