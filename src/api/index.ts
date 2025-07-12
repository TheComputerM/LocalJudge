import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { adminApp } from "./admin";
import { contestApp } from "./contest";
import { pistonApp } from "./piston";

export const baseApp = new Elysia({ prefix: "/api" })
	.use(
		swagger({
			path: "/swagger",
			specPath: "swagger/json",
			documentation: {
				info: {
					title: "LocalJudge Documentation",
					version: "1.0.0",
				},
			},
		}),
	)
	.onError(({ error }) => {
		console.log(error);
	})
	.use(contestApp)
	.use(adminApp)
	.use(pistonApp);

export type App = typeof baseApp;
