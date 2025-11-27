/**
 * Run `bunx --bun @better-auth/cli@latest generate` to
 * generate src/db/auth-schema.ts
 *
 * you might need to install node-gyp to get it to work.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { type SocialProviders } from "better-auth/social-providers";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/db";
import * as authSchema from "@/db/schema/auth";
import env from "@/lib/env";

const providersFile = Bun.file("./providers.json");
const socialProviders: SocialProviders = (await providersFile.exists())
	? await providersFile.json()
	: {};

export const auth = betterAuth({
	appName: "LocalJudge",
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	database: drizzleAdapter(db, {
		schema: authSchema,
		provider: "pg",
	}),
	socialProviders,
	plugins: [admin(), tanstackStartCookies()],
});
