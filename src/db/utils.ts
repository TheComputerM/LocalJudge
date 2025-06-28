import { SQL } from "bun";
import env from "@/lib/env";

/**
 * Creates a sql client using bunjs, useful for pre-populating database
 * credentials from environment.
 */
export function createBunSQLClient(options?: Bun.SQLOptions) {
	return new SQL({
		hostname: "localhost",
		port: env.POSTGRES_PORT,
		database: env.POSTGRES_DB,
		username: env.POSTGRES_USER,
		password: env.POSTGRES_PASSWORD,
		ssl: false,

		...options,
	});
}
