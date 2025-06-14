/**
 * Run `bunx --bun @better-auth/cli@latest generate` to generate src/db/auth-schema.ts
 * You might need to install node-gyp to get it to work.
 */

import { db } from "@/db";
import env from "@/lib/env";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
	appName: "LocalJudge",
	secret: env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	plugins: [admin()],
});
