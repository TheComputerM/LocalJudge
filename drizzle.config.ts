import env from "@/lib/env";
import { defineConfig } from "drizzle-kit";

// TODO: remove `pg` once https://github.com/drizzle-team/drizzle-orm/pull/4109 gets merged

export default defineConfig({
	out: "./drizzle",
	schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
	dialect: "postgresql",
	dbCredentials: {
		// TODO: change database settings based on container settings
		host: "localhost",
		port: env.POSTGRES_PORT,
		database: env.POSTGRES_OPERATOR_DB,
		password: env.POSTGRES_PASSWORD,
		user: env.POSTGRES_USER,
		ssl: false,
	},
});
