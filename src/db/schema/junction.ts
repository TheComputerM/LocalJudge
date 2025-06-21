/**
 * Contains junction tables that are used for many-to-many
 * relations in postgres.
 *
 * Also contains relations for auth schema tables.
 */

import { relations } from "drizzle-orm";
import { primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { contest, operatorSchema, submission } from "./operator";

export const userRelations = relations(user, ({ many }) => ({
	submissions: many(submission),
	userToContest: many(userToContest),
}));

export const userToContest = operatorSchema.table(
	"users_to_contest",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		contestId: uuid("contest_id")
			.notNull()
			.references(() => contest.id),
	},
	(t) => [primaryKey({ columns: [t.userId, t.contestId] })],
);

export const userToContestRelations = relations(userToContest, ({ one }) => ({
	contest: one(contest, {
		fields: [userToContest.contestId],
		references: [contest.id],
	}),
	user: one(user, {
		fields: [userToContest.userId],
		references: [user.id],
	}),
}));
