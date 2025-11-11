import { and, eq, is, sql } from "drizzle-orm";
import { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import { getTableConfig, PgTable } from "drizzle-orm/pg-core";
import * as table from "@/db/schema";
import { auth } from "@/lib/auth";
import env from "@/lib/env";

export namespace DatabaseUtils {
	/**
	 * Remove all existing data from localjudge present in database
	 *
	 * Adopted from:
	 * https://github.com/drizzle-team/drizzle-orm/blob/ac1dcd9d1c4b8f171479af4a5dd731db1e164f58/drizzle-seed/src/index.ts#L482
	 */
	export async function clean(db: BunSQLDatabase<typeof table>) {
		const tablesToTruncate = Object.entries(table)
			.filter(([_, t]) => is(t, PgTable))
			.map(([_, t]) => {
				const config = getTableConfig(t as PgTable);
				const schema = config.schema ?? "public";
				return `${schema}.${config.name}`;
			});

		await db.execute(
			sql.raw(`truncate ${tablesToTruncate.join(",")} cascade;`),
		);
	}

	/**
	 * Runs migrations and creates the admin account
	 */
	export async function setup(db: BunSQLDatabase<typeof table>) {
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
					name: "Administrator",
					email: env.ADMIN_EMAIL,
					password: env.ADMIN_PASSWORD,
					role: "admin",
				},
			});
		}
	}

	export async function reset(db: BunSQLDatabase<typeof table>) {
		await clean(db);
		await setup(db);
	}
}
