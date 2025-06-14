import { z } from "zod/v4";

const envSchema = z.object({
	POSTGRES_HOST: z.string().default("localhost"),
	POSTGRES_PORT: z.coerce.number().default(5432),
	POSTGRES_USER: z.string().default("postgres"),
	POSTGRES_DB: z.string().default("postgres"),
	POSTGRES_PASSWORD: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	ADMIN_EMAIL: z.string(),
	ADMIN_PASSWORD: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
