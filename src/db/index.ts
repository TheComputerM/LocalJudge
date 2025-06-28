import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";
import { createBunSQLClient } from "./utils";

const client = createBunSQLClient();

export const db = drizzle({
	schema,
	client,
});
