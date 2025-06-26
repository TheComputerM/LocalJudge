import { createSchemaFactory } from "drizzle-typebox";
import { t } from "elysia";

export const { createInsertSchema, createSelectSchema } = createSchemaFactory({
	typeboxInstance: t,
});
