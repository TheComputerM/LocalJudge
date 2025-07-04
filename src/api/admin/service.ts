import { db } from "@/db";
import * as table from "@/db/schema";
import { ContestModel } from "@/db/typebox/contest";

export abstract class AdminService {
	static async createContest(contest: typeof ContestModel.insert.static) {
		const [data] = await db.insert(table.contest).values(contest).returning();
		return data;
	}
}
