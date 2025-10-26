import { createFileRoute } from "@tanstack/react-router";
import useSWR from "swr";
import { localjudge } from "@/api/client";
import { $localjudge } from "@/api/fetch";
import { SubmissionModel } from "@/api/submission/model";
import { BufferTextBlock } from "@/components/buffer-text-block";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/app/_dashboard/submission/$id")({
	loader: async ({ params }) => {
		const [submission, results] = await Promise.all([
			rejectError(localjudge.submission({ submission: params.id }).get()),
			rejectError(
				localjudge.submission({ submission: params.id }).results.get(),
			),
		]);
		return { submission, results };
	},
	component: RouteComponent,
});

type Result = typeof SubmissionModel.Result.select.static;

interface ResultCardProps extends Result {
	contestId: string;
	problemNumber: number;
}

function ResultCard(props: ResultCardProps) {
	const { data, error, isLoading } = useSWR(
		[
			"/api/contest/:id/problem/:problem/testcase/:testcase" as const,
			{
				id: props.contestId,
				problem: props.problemNumber,
				testcase: props.testcaseNumber,
			},
		],
		async ([url, params]) =>
			await rejectError(
				$localjudge(url, {
					method: "GET",
					params,
				}),
			),
	);

	return (
		<Card>
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
			<CardContent className="grid grid-cols-2 gap-3">
				<BufferTextBlock className="col-span-2" label="Input">
					{isLoading ? (
						"..."
					) : data ? (
						data.input
					) : error?.status === 403 ? (
						<i>Hidden</i>
					) : (
						"error"
					)}
				</BufferTextBlock>
				<BufferTextBlock label="Expected">
					{isLoading ? (
						"..."
					) : data ? (
						data.output
					) : error?.status === 403 ? (
						<i>Hidden</i>
					) : (
						"error"
					)}
				</BufferTextBlock>
				<BufferTextBlock label="Actual">{props.stdout}</BufferTextBlock>
			</CardContent>
			<CardFooter className="justify-between">
				<span>Time: {props.time}ms</span>
				<span>Memory: {props.memory}KB</span>
			</CardFooter>
		</Card>
	);
}

function Results() {
	const { results, params } = Route.useLoaderData({
		select: ({ results, submission }) => ({
			results,
			params: { id: submission.contestId, problem: submission.problemNumber },
		}),
	});

	return (
		<div className="grid gap-4">
			{results.map((result) => (
				<ResultCard
					key={result.testcaseNumber}
					contestId={params.id}
					problemNumber={params.problem}
					{...result}
				/>
			))}
		</div>
	);
}

function SubmissionTable() {
	const submission = Route.useLoaderData({
		select: ({ submission }) => submission,
	});

	return (
		<Table>
			<TableBody>
				<TableRow>
					<TableHead>User</TableHead>
					<TableCell>{submission.user.name}</TableCell>

					<TableHead>Status</TableHead>
					<TableCell>
						<SubmissionStatusPill id={submission.id} />
					</TableCell>
				</TableRow>
				<TableRow>
					<TableHead>Contest</TableHead>
					<TableCell>{submission.contestId}</TableCell>

					<TableHead>Language</TableHead>
					<TableCell>{submission.language}</TableCell>
				</TableRow>
				<TableRow>
					<TableHead>Problem</TableHead>
					<TableCell>
						{submission.problemNumber}. {submission.problem.title}
					</TableCell>
					<TableHead>Time</TableHead>
					<TableCell>{submission.createdAt.toLocaleString()}</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}

function RouteComponent() {
	return (
		<div className="container mx-auto p-4">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Submission
			</h1>
			<br />
			<SubmissionTable />
			<br />
			<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
				Results
			</h2>
			<br />
			<Results />
		</div>
	);
}
