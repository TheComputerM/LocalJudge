import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { differenceInSeconds } from "date-fns";
import { eq } from "drizzle-orm";
import { LucideCheck } from "lucide-react";
import { localjudge } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { problem } from "@/db/schema";
import { rejectError } from "@/lib/utils";

const getProblemCountFn = createServerFn({ method: "GET" })
	.inputValidator((data: string) => data)
	.handler(async ({ data }) => {
		const count = db.$count(problem, eq(problem.contestId, data));
		return count;
	});

export const Route = createFileRoute("/_authenticated/contest/$id/leaderboard")(
	{
		loader: async ({ params, abortController, context }) => {
			const [leaderboard, problemCount] = await Promise.all([
				rejectError(
					localjudge
						.contest({ id: params.id })
						.leaderboard.get({ fetch: { signal: abortController.signal } }),
				),
				getProblemCountFn({ data: params.id }),
			]);
			return { leaderboard, problemCount, contest: context.contest };
		},
		component: RouteComponent,
	},
);

function extend<T extends { problem_number: number }>(
	length: number,
	submissions: T[],
): (T | null)[] {
	const output = new Array(length).fill(null);
	for (const submission of submissions) {
		output[submission.problem_number - 1] = submission;
	}
	return output;
}

function formatDuration(start: Date, end: Date) {
	const seconds = differenceInSeconds(end, start);
	return `${Math.floor(seconds / 60)}m:${seconds % 60}s`;
}

function RouteComponent() {
	const data = Route.useLoaderData();
	return (
		<div className="container mx-auto p-4">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Leaderboard
			</h1>
			<Separator className="my-6" />
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead colSpan={2} className="border-r" />
						<TableHead colSpan={data.problemCount} className="text-center">
							Problems
						</TableHead>
					</TableRow>
					<TableRow>
						<TableHead>Rank</TableHead>
						<TableHead className="border-r">User</TableHead>
						{Array.from({ length: data.problemCount }, (_, i) => (
							<TableHead key={i} className="text-center">
								<Button variant="link" asChild>
									<Link
										from={Route.fullPath}
										to="../problem/$problem"
										params={{ problem: (i + 1).toString() }}
									>
										{i + 1}
									</Link>
								</Button>
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.leaderboard.map((user, i) => (
						<TableRow key={user.id}>
							<TableCell>{i + 1}</TableCell>
							<TableCell className="border-r">
								<span className="font-medium">{user.name}</span>
								<div className="text-sm text-muted-foreground">
									{user.email}
								</div>
							</TableCell>

							{extend(data.problemCount, user.submissions).map((s, i) => (
								<TableCell key={i}>
									{s && (
										<div className="w-full text-center">
											<LucideCheck className="w-full h-4 text-emerald-500" />
											<span className="text-xs text-muted-foreground">
												{formatDuration(data.contest.startTime, s.created_at)}
											</span>
										</div>
									)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
