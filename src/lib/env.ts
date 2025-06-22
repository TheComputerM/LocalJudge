import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const envSchema = Type.Object({
	POSTGRES_HOST: Type.String({ default: "localhost" }),
	POSTGRES_PORT: Type.Number({ default: 5432 }),
	POSTGRES_USER: Type.String({ default: "postgres" }),
	POSTGRES_DB: Type.String({ default: "postgres" }),
	POSTGRES_PASSWORD: Type.String(),
	BETTER_AUTH_URL: Type.String(),
	BETTER_AUTH_SECRET: Type.String(),
	ADMIN_EMAIL: Type.String(),
	ADMIN_PASSWORD: Type.String(),
});

const env = Value.Parse(envSchema, process.env);

export default env;
