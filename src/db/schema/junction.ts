/**
 * Contains junction tables that are used for many-to-many
 * relations in postgres.
 *
 * Also contains relations for auth schema tables.
 */

import { relations } from "drizzle-orm";
import { char, primaryKey, text } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { contest, operatorSchema, submission } from "./operator";

export const userRelations = relations(user, ({ many }) => ({
	submissions: many(submission),
	registrations: many(registration),
}));

/**
 * Each row in this table indicates that a user has registered for a specific contest.
 * The composite primary key ensures that a user cannot register for the same contest more than once.
 */
export const registration = operatorSchema.table(
	"registration",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		contestId: char("contest_id", { length: 12 })
			.notNull()
			.references(() => contest.id),
	},
	(t) => [primaryKey({ columns: [t.userId, t.contestId] })],
);

export const registrationRelations = relations(registration, ({ one }) => ({
	contest: one(contest, {
		fields: [registration.contestId],
		references: [contest.id],
	}),
	user: one(user, {
		fields: [registration.userId],
		references: [user.id],
	}),
}));
