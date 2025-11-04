import { defineConfig } from "drizzle-kit";
import env from "@/lib/env";

// TODO: remove `pg` once https://github.com/drizzle-team/drizzle-orm/pull/4109 gets merged

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema",
	dialect: "postgresql",
	dbCredentials: {
		host: env.POSTGRES_HOST,
		port: env.POSTGRES_PORT,
		database: env.POSTGRES_DB,
		password: env.POSTGRES_PASSWORD,
		user: env.POSTGRES_USER,
		ssl: false,
	},
});
