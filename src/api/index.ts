import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { adminApp } from "./admin";
import { contestApp } from "./contest";
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
	.use(userApp)
	.use(adminApp)
	.use(contestApp);

export type App = typeof baseApp;
