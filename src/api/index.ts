import * as path from "node:path";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { adminApp } from "./admin";
import { contestApp } from "./contest";
import { localboxApp } from "./localbox";
import { submissionApp } from "./submission";

export const baseApp = new Elysia({ prefix: "/api" })
	.use(
		openapi({
			// references: fromTypes("./src/api/index.ts", {
			// 	tsconfigPath: path.join(process.cwd(), "tsconfig.json"),
			// }),
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
	.use(submissionApp)
	.use(adminApp)
	.use(localboxApp);

export type App = typeof baseApp;
