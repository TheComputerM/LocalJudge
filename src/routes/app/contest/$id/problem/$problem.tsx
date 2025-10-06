import Editor from "@monaco-editor/react";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { LucideCloudUpload } from "lucide-react";
import Markdown from "react-markdown";
import useSWR from "swr";
import { localjudge } from "@/api/client";
import { $localjudge } from "@/api/fetch";
import { Button } from "@/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/app/contest/$id/problem/$problem")({
	loader: async ({ params, abortController }) => {
		const [problem, testcases] = await Promise.all([
			rejectError(
				localjudge.api
					.contest({ id: params.id })
					.problem({ problem: params.problem })
					.get({ fetch: { signal: abortController.signal } }),
			),
			rejectError(
				localjudge.api
					.contest({ id: params.id })
					.problem({ problem: params.problem })
					.testcase.get(),
			),
		]);

		return { problem, testcases };
	},
	component: RouteComponent,
});

function SubmitCode() {
	const { id, problem } = Route.useParams();
	async function handleSubmit() {
		const { data, error } = await localjudge.api
			.contest({ id })
			.problem({ problem })
			.post();
		if (error) alert(JSON.stringify(error));
		console.log(data);
	}

	return (
		<Button variant="outline" onClick={handleSubmit}>
			<LucideCloudUpload />
			Submit
		</Button>
	);
}

function LanguageSelect() {
	const languages = useLoaderData({
		from: "/app/contest/$id",
		select: (data) => data.settings.languages,
	});

	return (
		<Select defaultValue={languages[0]}>
			<SelectTrigger>
				<SelectValue placeholder="Language" />
			</SelectTrigger>
			<SelectContent>
				{languages.map((lang) => (
					<SelectItem key={lang} value={lang}>
						{lang}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function Navbar() {
	return (
		<div className="flex shrink-0 h-14 items-center justify-between gap-2 border-b px-4">
			<div className="inline-flex items-center gap-2">
				<SidebarTrigger className="-ml-1" />
				Problems
			</div>
			<SubmitCode />
			<LanguageSelect />
		</div>
	);
}

function TestcaseContent({ number }: { number: number }) {
	const { id, problem } = Route.useParams();
	const { data, error, isLoading } = useSWR(
		[
			"/api/contest/:id/problem/:problem/testcase/:testcase" as const,
			{ id, problem: Number.parseInt(problem), testcase: number },
		],
		([url, params]) => rejectError($localjudge(url, { params })),
		{
			revalidateIfStale: false,
		},
	);

	if (isLoading) return <Spinner />;
	if (error || !data) return <div>Error: {JSON.stringify(error)}</div>;

	return (
		<div className="typography">
			<span>Input: </span>
			<pre>
				<code>{data.input}</code>
			</pre>
			<Separator className="my-4" />
			<span>Expected Output: </span>
			<pre>
				<code>{data.output}</code>
			</pre>
		</div>
	);
}

function TestcaseList() {
	const testcases = Route.useLoaderData({ select: (data) => data.testcases });

	return (
		<Tabs
			orientation="vertical"
			className="w-full flex-row items-start"
			defaultValue={testcases[0]?.number.toString()}
		>
			<TabsList className="flex-col h-auto" aria-label="Testcases">
				{testcases.map((tc) => (
					<TabsTrigger
						disabled={tc.hidden}
						value={tc.number.toString()}
						key={tc.number}
						className="w-full"
					>
						Case {tc.number}
					</TabsTrigger>
				))}
			</TabsList>
			<div className="grow p-4">
				{testcases.map((tc) => (
					<TabsContent value={tc.number.toString()} key={tc.number}>
						<TestcaseContent number={tc.number} />
					</TabsContent>
				))}
			</div>
		</Tabs>
	);
}

function ProblemStatement() {
	const problem = Route.useLoaderData({
		select: (data) => data.problem,
	});
	return (
		<div className="typography">
			<h1>{problem.title}</h1>
			<Markdown>{problem.description}</Markdown>
		</div>
	);
}

function CodeEditor() {
	return (
		<Editor
			language="python"
			theme="vs-dark"
			options={{
				folding: false,
				lineNumbers: "off",
				fontFamily: "'JetBrains Mono Variable', monospace",
				minimap: {
					enabled: false,
				},
			}}
		/>
	);
}

function RouteComponent() {
	return (
		<>
			<Navbar />
			<ResizablePanelGroup direction="horizontal" className="h-full">
				<ResizablePanel className="p-2">
					<Tabs defaultValue="statement">
						<TabsList className="w-full">
							<TabsTrigger value="statement">Statement</TabsTrigger>
							<TabsTrigger value="testcases">Testcases</TabsTrigger>
						</TabsList>
						<TabsContent value="statement">
							<ProblemStatement />
						</TabsContent>
						<TabsContent value="testcases">
							<TestcaseList />
						</TabsContent>
					</Tabs>
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>
					<CodeEditor />
				</ResizablePanel>
			</ResizablePanelGroup>
		</>
	);
}
