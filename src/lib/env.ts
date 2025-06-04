import "dotenv/config";

import { z } from "zod/v4";

const envSchema = z.object({
	POSTGRES_HOST: z.string(),
	POSTGRES_PORT: z.coerce.number(),
	POSTGRES_USER: z.string(),
	POSTGRES_PASSWORD: z.string(),
	POSTGRES_OPERATOR_DB: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	ADMIN_EMAIL: z.string(),
	ADMIN_PASSWORD: z.string(),
});

const env = envSchema.parse(process.env);

export default env;
