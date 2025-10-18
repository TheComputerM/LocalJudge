import { createFileRoute } from "@tanstack/react-router";
import useSWR from "swr";
import { localjudge } from "@/api/client";
import { $localjudge } from "@/api/fetch";
import { SubmissionModel } from "@/api/submission/model";
import { Pill, PillIndicator } from "@/components/kibo-ui/pill";
import { SubmissionStatusPill } from "@/components/submission-status-pill";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/app/submission/$id")({
	loader: async ({ params }) => {
		const submission = await rejectError(
			localjudge.submission({ submission: params.id }).get(),
		);
		return { submission };
	},
	component: RouteComponent,
});

function ResultCard(
	props: (typeof SubmissionModel.select.static)["results"][number],
) {
	const params = Route.useLoaderData({
		select: ({ submission }) => ({
			id: submission.contestId,
			problem: submission.problemNumber,
		}),
	});

	const { data } = useSWR(
		[
			"/api/contest/:id/problem/:problem/testcase/:testcase" as const,
			{
				...params,
				testcase: props.testcaseNumber,
			},
		],
		async ([url, params]) =>
			await rejectError(
				$localjudge(url, {
					params,
				}),
			),
	);

	return (
		<Card key={props.testcaseNumber}>
			<CardHeader>
				<CardTitle>Testcase {props.testcaseNumber}</CardTitle>
				<CardDescription>{props.message}</CardDescription>
				<CardAction>
					<Pill>
						<PillIndicator
							variant={props.status === "CA" ? "success" : "error"}
						/>
						{props.status}
					</Pill>
				</CardAction>
			</CardHeader>
			<CardContent className="grid grid-cols-2 gap-3 typography">
				<div className="col-span-2">
					<span>Input</span>
					<pre className="my-2">{data?.input ?? <i>Hidden</i>}</pre>
				</div>
				<div>
					<span>Expected</span>
					<pre className="my-2">{data?.output ?? <i>Hidden</i>}</pre>
				</div>
				<div>
					<span>Actual</span>
					<pre className="my-2">{props.stdout}</pre>
				</div>
			</CardContent>
			<CardFooter className="justify-between">
				<span>Time: {props.time}ms</span>
				<span>Memory: {props.memory}KB</span>
			</CardFooter>
		</Card>
	);
}

function RouteComponent() {
	const submission = Route.useLoaderData({
		select: ({ submission }) => submission,
	});
	return (
		<div className="container mx-auto">
			<br />
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>User</TableHead>
						<TableHead>Contest</TableHead>
						<TableHead>Problem</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Language</TableHead>
						<TableHead>Time</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>{submission.user.name}</TableCell>
						<TableCell>{submission.contestId}</TableCell>
						<TableCell>
							{submission.problemNumber}. {submission.problem.title}
						</TableCell>
						<TableCell>
							<SubmissionStatusPill
								total={submission.results.length}
								passed={
									submission.results.filter((result) => result.status === "CA")
										.length
								}
							/>
						</TableCell>
						<TableCell>{submission.language}</TableCell>
						<TableCell>{submission.createdAt.toLocaleString()}</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<Separator className="my-6" />
			<div className="grid gap-4">{submission.results.map(ResultCard)}</div>
		</div>
	);
}
