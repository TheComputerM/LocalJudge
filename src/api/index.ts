import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { betterAuthPlugin } from "./better-auth";

export const app = new Elysia({ prefix: "/api" })
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
	.use(betterAuthPlugin);
