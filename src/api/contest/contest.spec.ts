import { beforeAll, describe, expect, test } from "bun:test";
import { addHours } from "date-fns";
import { localjudge } from "@/api/client";
import { db } from "@/db";
import * as table from "@/db/schema";
import { DatabaseUtils } from "@/db/utils";
import { TestUtils } from "@/lib/test.utils";
import { AdminService } from "../admin/service";
import { ContestAdminService } from "./service";

describe("Snapshots", () => {
	let contest: typeof table.contest.$inferSelect;
	let user: Awaited<ReturnType<typeof TestUtils.createTestUser>>;
	beforeAll(async () => {
		await DatabaseUtils.reset(db);
		contest = await ContestAdminService.create({
			name: "Snapshot Contest",
			startTime: new Date(),
			endTime: addHours(new Date(), 2),
			settings: {
				leaderboard: true,
				submissions_limit: 0,
				languages: ["cpp", "python"],
				visible_results: true,
			},
		});
		user = await TestUtils.createTestUser();
		await localjudge.contest.register.post(contest.id, {
			headers: { cookie: user.cookie },
		});
	});

	test("initial snapshot", async () => {
		const { data, status } = await localjudge
			.contest({ id: contest.id })
			.snapshot.post(
				{
					cpp: { 1: "this is code for cpp problem 1" },
				},
				{ headers: { cookie: user.cookie } },
			);
		expect(status).toBe(200);
		expect(data).toMatchObject({
			cpp: { 1: "this is code for cpp problem 1" },
		});
		const timeline = await AdminService.timeline(user.data.id, contest.id);
		expect(timeline).toHaveLength(1);
	});

	test("send the same content", async () => {
		const { data, status } = await localjudge
			.contest({ id: contest.id })
			.snapshot.post(
				{
					cpp: { 1: "this is code for cpp problem 1" },
				},
				{ headers: { cookie: user.cookie } },
			);
		expect(status).toBe(200);
		expect(data).toMatchObject({
			cpp: { 1: "this is code for cpp problem 1" },
		});
		const timeline = await AdminService.timeline(user.data.id, contest.id);
		expect(timeline).toHaveLength(1);
	});

	test("send updated content", async () => {
		const { data, status } = await localjudge
			.contest({ id: contest.id })
			.snapshot.post(
				{
					cpp: { 1: "this is modified code for cpp problem 1" },
				},
				{ headers: { cookie: user.cookie } },
			);
		expect(status).toBe(200);
		expect(data).toMatchObject({
			cpp: { 1: "this is modified code for cpp problem 1" },
		});
		const timeline = await AdminService.timeline(user.data.id, contest.id);
		expect(timeline).toHaveLength(2);
	});

	test("snapshot for another language", async () => {
		const { data, status } = await localjudge
			.contest({ id: contest.id })
			.snapshot.post(
				{
					python: { 1: "this is code for python problem 1" },
				},
				{ headers: { cookie: user.cookie } },
			);
		expect(status).toBe(200);
		expect(data).toMatchObject({
			cpp: { 1: "this is modified code for cpp problem 1" },
			python: { 1: "this is code for python problem 1" },
		});
		const timeline = await AdminService.timeline(user.data.id, contest.id);
		expect(timeline).toHaveLength(3);
	});

	test("snapshot for another problem", async () => {
		const { data, status } = await localjudge
			.contest({ id: contest.id })
			.snapshot.post(
				{
					cpp: { 2: "this is code for cpp problem 2" },
				},
				{ headers: { cookie: user.cookie } },
			);
		expect(status).toBe(200);
		expect(data).toMatchObject({
			cpp: {
				1: "this is modified code for cpp problem 1",
				2: "this is code for cpp problem 2",
			},
			python: { 1: "this is code for python problem 1" },
		});
		const timeline = await AdminService.timeline(user.data.id, contest.id);
		expect(timeline).toHaveLength(4);
	});
});
