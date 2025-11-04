import { Editor } from "@monaco-editor/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LucideCopy } from "lucide-react";
import { Fragment } from "react";
import { localjudge } from "@/api/client";
import { $localjudge } from "@/api/fetch";
import { BufferTextBlock } from "@/components/buffer-text-block";
import { Pill, PillIndicator } from "@/components/kibo-ui/pill";
import { useTheme } from "@/components/providers/theme";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import {
	Accordion,
	AccordionItem,
	AccordionPanel,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from "@/components/ui/table";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/submission/$id")({
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

function TestcaseContent(props: {
	contestId: string;
	problemNumber: number;
	testcaseNumber: number;
}) {
	const { data, error, isLoading } = useQuery({
		queryKey: [
			"/api/contest/:id/problem/:problem/testcase/:testcase",
			{
				id: props.contestId,
				problem: props.problemNumber,
				testcase: props.testcaseNumber,
			},
		] as const,
		queryFn: async ({ queryKey: [url, params] }) => {
			const { data, error } = await $localjudge(url, {
				method: "GET",
				params,
			});
			if (error) {
				if (error.status === 403) {
					return {
						input: "HIDDEN",
						output: "HIDDEN",
					};
				}
				throw error;
			}
			return data;
		},
	});

	if (isLoading) {
		return (
			<Fragment>
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
			</Fragment>
		);
	}

	if (error) {
		return (
			<div className="text-red-500 col-span-2">
				Failed to load testcases: {JSON.stringify(error)}
			</div>
		);
	}

	return (
		<Fragment>
			<BufferTextBlock label="Input">{data?.input}</BufferTextBlock>
			<BufferTextBlock label="Expected Output">{data?.output}</BufferTextBlock>
		</Fragment>
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
		<Accordion>
			{results.map((result) => (
				<AccordionItem
					key={result.testcaseNumber}
					value={result.testcaseNumber.toString()}
				>
					<AccordionTrigger className="items-center px-2">
						<div className="inline-flex items-center gap-3 grow">
							<Pill>
								<PillIndicator
									variant={result.status === "CA" ? "success" : "error"}
									pulse={result.status !== "CA"}
								/>
								{result.status}
							</Pill>
							<div className="inline-flex flex-col text-md">
								Testcase {result.testcaseNumber}
							</div>
						</div>
						<span className="text-sm text-muted-foreground">
							{result.message}
						</span>
					</AccordionTrigger>
					<AccordionPanel className="mt-2 text-foreground">
						<div className="flex items-center justify-between">
							<span>Time: {result.time}ms</span>
							<span>Memory: {result.memory}KB</span>
						</div>
						<br />
						<div className="grid grid-cols-2 gap-3">
							<TestcaseContent
								contestId={params.id}
								problemNumber={params.problem}
								testcaseNumber={result.testcaseNumber}
							/>
							<BufferTextBlock label="Output" className="col-span-2">
								{result.stdout}
							</BufferTextBlock>
						</div>
					</AccordionPanel>
				</AccordionItem>
			))}
		</Accordion>
	);
}

function Details() {
	const submission = Route.useLoaderData({
		select: ({ submission }) => submission,
	});
	return (
		<Table className="table">
			<TableBody className="[&_th]:bg-muted/50 [&_th]:border-r">
				<TableRow>
					<TableHead>ID</TableHead>
					<TableCell>
						<Badge size="sm">
							<LucideCopy />
							{submission.id}
						</Badge>
					</TableCell>
				</TableRow>
				<TableRow>
					<TableHead>User</TableHead>
					<TableCell>{submission.user.name}</TableCell>
				</TableRow>
				<TableRow>
					<TableHead>Contest</TableHead>
					<TableCell>{submission.contest.name}</TableCell>
				</TableRow>
				<TableRow>
					<TableHead>Language</TableHead>
					<TableCell>{submission.language}</TableCell>
				</TableRow>
				<TableRow>
					<TableHead>Problem</TableHead>
					<TableCell>{submission.problem.title}</TableCell>
				</TableRow>
				<TableRow>
					<TableHead>Status</TableHead>
					<TableCell>
						<SubmissionStatusBadge id={submission.id} />
					</TableCell>
				</TableRow>
				<TableRow>
					<TableHead>Time</TableHead>
					<TableCell>{submission.createdAt.toLocaleString()}</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}

function Source() {
	const [theme] = useTheme();
	const submission = Route.useLoaderData({
		select: ({ submission }) => submission,
	});
	return (
		<div>
			<div className="flex items-center mb-1">
				<h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
					Source
				</h4>
				<div className="grow" />
				<Button size="icon" variant="ghost">
					<LucideCopy />
				</Button>
			</div>
			<Editor
				height="280px"
				theme={theme === "dark" ? "vs-dark" : "light"}
				language={submission.language}
				value={submission.content}
				options={{
					readOnly: true,
					lineNumbers: "on",
					fontFamily: "var(--font-mono), monospace",
					minimap: {
						enabled: false,
					},
				}}
			/>
		</div>
	);
}

function RouteComponent() {
	return (
		<div className="container mx-auto p-4">
			<h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
				Submission
			</h2>
			<br />
			<div className="grid grid-cols-2 gap-3">
				<div>
					<h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2">
						Details
					</h4>
					<div className="border rounded">
						<Details />
					</div>
				</div>
				<Source />
			</div>
			<Separator className="my-6" />
			<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2">
				Results
			</h3>
			<Results />
		</div>
	);
}
