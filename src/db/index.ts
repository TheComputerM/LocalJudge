import env from "@/lib/env";
import { drizzle } from "drizzle-orm/bun-sql";
import * as authSchema from "./auth-schema";
import * as generalSchema from "./schema";

export const schema = { ...authSchema, ...generalSchema };

export const db = drizzle({
	schema,
	connection: {
		host: "localhost",
		port: env.POSTGRES_PORT,
		database: env.POSTGRES_OPERATOR_DB,
		password: env.POSTGRES_PASSWORD,
		user: env.POSTGRES_USER,
		ssl: false,
	},
});
