import { and, eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import env from "@/lib/env";

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
const adminCount = await db.$count(
	user,
	and(eq(user.email, env.ADMIN_EMAIL), eq(user.role, "admin")),
);

if (adminCount === 0) {
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
