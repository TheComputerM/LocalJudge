import Elysia from "elysia";
import { db } from "@/db";
import { contest } from "@/db/schema";

export const contestApp = new Elysia({ prefix: "/contest" }).get(
	"/",
	async () => {
		const contests = await db.select().from(contest);
		return contests;
	},
);
