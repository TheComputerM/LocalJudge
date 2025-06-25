import { isAfter } from "date-fns";
import { eq } from "drizzle-orm";
import Elysia, { status, t } from "elysia";
import { db } from "@/db";
import * as table from "@/db/schema";
import { contestSchema } from "@/db/typebox/contest";
import { piston } from "@/lib/piston";
import { rejectError } from "@/lib/utils";
import { betterAuthPlugin } from "./better-auth";

export const adminApp = new Elysia({ prefix: "/admin" })
	.use(betterAuthPlugin)
	.guard({ auth: "admin" })
	.get("/contest", async () => {
		return await db.query.contest.findMany();
	})
	.post(
		"/contest",
		async ({ body }) => {
			if (isAfter(body.startTime, body.endTime)) {
				return status(400, "Start time cannot be after end time.");
			}
			const [data] = await db.insert(table.contest).values(body).returning();
			return data;
		},
		{
			body: contestSchema.insert,
			detail: {
				description: "Create a new contest",
			},
		},
	)
	.get("/overview", async () => {
		const _stats = await Promise.all([
			db.$count(table.contest),
			db.$count(table.user, eq(table.user.role, "user")),
			db.$count(table.submission),
		]);

		return {
			statistics: {
				contests: _stats[0],
				participants: _stats[1],
				submissions: _stats[2],
			},
		};
	})
	.group("/piston", (app) =>
		app
			.get("/packages", async () => rejectError(piston("@get/packages")))
			.get("/runtimes", async () => rejectError(piston("@get/runtimes")))
			.guard(
				{
					body: t.Object({
						language: t.String(),
						version: t.String(),
					}),
				},
				(app) =>
					app
						.post("/packages", async ({ body }) =>
							rejectError(piston("@post/packages", { body })),
						)
						.delete("/packages", async ({ body }) =>
							rejectError(piston("@delete/packages", { body })),
						),
			),
	);
