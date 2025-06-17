import { drizzle } from "drizzle-orm/bun-sql";
import env from "@/lib/env";
import * as schema from "./schema";

export const db = drizzle({
	schema,
	connection: {
		host: "localhost",
		port: env.POSTGRES_PORT,
		database: env.POSTGRES_DB,
		password: env.POSTGRES_PASSWORD,
		user: env.POSTGRES_USER,
		ssl: false,
	},
});
