import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import * as table from "@/db/schema";
import env from "@/lib/env";

const client = new SQL({
	hostname: env.POSTGRES_HOST,
	port: env.POSTGRES_PORT,
	database: env.POSTGRES_DB,
	username: env.POSTGRES_USER,
	password: env.POSTGRES_PASSWORD,
	ssl: false,

	max: 1,
});

/**
 * Main difference is that this drizzle client doesn't pool connections
 * as it is used for automation tasks rather than user interactions
 */
export const taskRunnerDB = drizzle({ schema: table, client });
