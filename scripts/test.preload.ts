import { afterAll, beforeAll, mock } from "bun:test";
import { delay } from "es-toolkit/promise";
import { DatabaseUtils } from "@/db/utils";
import env from "@/lib/env";

// Start a Postgres container before all tests and stop it after all tests
let containerId = "";
beforeAll(
	async () => {
		// TODO: testcontainer issue with bun: https://github.com/oven-sh/bun/issues/21342
		const containerProc = Bun.spawnSync([
			"docker",
			"run",
			"--rm",
			"-d",
			"-e",
			`POSTGRES_USER=${env.POSTGRES_USER}`,
			"-e",
			`POSTGRES_DB=${env.POSTGRES_DB}`,
			"-e",
			`POSTGRES_PASSWORD=${env.POSTGRES_PASSWORD}`,
			"-p",
			`${env.POSTGRES_PORT}:5432`,
			"postgres:18-alpine",
		]);

		containerId = containerProc.stdout.toString().trim();
		await delay(4000); // Wait for Postgres to initialize
		const { db } = await import("@/db");
		await DatabaseUtils.setup(db);
	},
	{
		timeout: 10000,
	},
);

afterAll(async () => {
	const { db } = await import("@/db");
	db.$client.close();
	Bun.spawnSync(["docker", "stop", containerId]);
});

// Simple Bun server to handle better-auth requests during tests
let server: Bun.Server<undefined>;
beforeAll(async () => {
	const { auth } = await import("@/lib/auth");
	server = Bun.serve({
		port: new URL(env.BETTER_AUTH_URL).port,
		routes: {
			"/api/auth/*": auth.handler,
		},
	});
});

afterAll(() => {
	server.stop();
});

mock.module("@/api/client", async () => {
	const { treaty } = await import("@elysiajs/eden");
	const { baseApp } = await import("@/api");

	const localjudge = treaty(baseApp).api;
	return { localjudge };
});
