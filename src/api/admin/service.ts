import { eq } from "drizzle-orm";
import { ContestModel } from "@/api/models/contest";
import { db } from "@/db";
import * as table from "@/db/schema";

export namespace AdminService {
	export async function createContest(
		contest: typeof ContestModel.insert.static,
	) {
		const [data] = await db.insert(table.contest).values(contest).returning();
		return data;
	}

	export async function updateContest(
		id: string,
		contest: typeof ContestModel.insert.static,
	) {
		await db.update(table.contest).set(contest).where(eq(table.contest.id, id));
	}
}
