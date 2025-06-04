import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { auth } from "@/lib/auth";
import env from "@/lib/env";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sql/migrator";

console.log("Running Drizzle SQL migrations...");
if (await Bun.file("./drizzle/meta/_journal.json").exists()) {
	await migrate(db, {
		migrationsFolder: "drizzle",
	});
	console.log("Migrations completed!");
} else {
	console.warn("No migrations found, skipping...");
}

console.log("Checking if Admin user exists...");
const [{ admin_exists }] = await db.execute<{ admin_exists: boolean }>(
	sql`SELECT EXISTS (SELECT 1 FROM ${user} WHERE ${user.role} = ${"admin"} AND ${user.email} = ${env.ADMIN_EMAIL}) as admin_exists`,
);

if (!admin_exists) {
	console.log("Creating Admin user...");
	await auth.api.createUser({
		body: {
			name: "Admin",
			email: env.ADMIN_EMAIL,
			password: env.ADMIN_PASSWORD,
			role: "admin",
		},
	});
	console.log("Admin user created!");
} else {
	console.log("Admin user already exists!");
}

// close database connection
await db.$client.end();
