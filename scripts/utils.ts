import { and, eq, is, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import { _ } from "node_modules/better-auth/dist/shared/better-auth.Da_FnxgM";
import * as table from "@/db/schema";
import { createBunSQLClient } from "@/db/utils";
import { auth } from "@/lib/auth";
import env from "@/lib/env";

const client = createBunSQLClient({
	max: 1,
});

/**
 * Main difference is that this drizzle client doesn't pool connections
 * as it is used for automation tasks rather than user interactions
 */
export const taskRunnerDB = drizzle({ schema: table, client });

type DrizzleClient = typeof taskRunnerDB;

/**
 * Remove all existing data from localjudge present in database
 *
 * Adopted from:
 * https://github.com/drizzle-team/drizzle-orm/blob/ac1dcd9d1c4b8f171479af4a5dd731db1e164f58/drizzle-seed/src/index.ts#L482
 */
export async function clean(db: DrizzleClient) {
	const tablesToTruncate = Object.entries(table)
		.filter(([_, t]) => is(t, PgTable))
		.map(([_, t]) => {
			const config = getTableConfig(t as PgTable);
			const schema = config.schema ?? "public";
			return `${schema}.${config.name}`;
		});

	await db.execute(sql.raw(`truncate ${tablesToTruncate.join(",")} cascade;`));
}

/**
 * Runs migrations and creates the admin account
 */
export async function setup(db: DrizzleClient) {
	if (await Bun.file("./drizzle/meta/_journal.json").exists()) {
		await migrate(db, {
			migrationsFolder: "drizzle",
		});
	}

	const adminCount = await db.$count(
		table.user,
		and(eq(table.user.email, env.ADMIN_EMAIL), eq(table.user.role, "admin")),
	);

	if (adminCount === 0) {
		await auth.api.createUser({
			body: {
				name: "Admin",
				email: env.ADMIN_EMAIL,
				password: env.ADMIN_PASSWORD,
				role: "admin",
			},
		});
	}
}

/**
 * Removes any existing data and runs migrations and creates admin account
 */
export async function reset(db: DrizzleClient) {
	await clean(db);
	await setup(db);
}
