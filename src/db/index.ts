import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import env from "@/lib/env";
import * as schema from "./schema";

const client = new SQL({
	hostname: env.POSTGRES_HOST,
	port: env.POSTGRES_PORT,
	database: env.POSTGRES_DB,
	username: env.POSTGRES_USER,
	password: env.POSTGRES_PASSWORD,
	ssl: false,
});

export const db = drizzle({
	schema,
	client,
});
