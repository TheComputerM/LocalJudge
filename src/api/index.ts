import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { adminApp } from "./admin";
import { contestApp } from "./contest";
import { userApp } from "./user";

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
	.use(userApp)
	.use(contestApp)
	.use(adminApp);

export type App = typeof baseApp;
