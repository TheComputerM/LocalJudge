import Editor from "@monaco-editor/react";
import { useThrottledCallback } from "@tanstack/react-pacer/throttler";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useSelector } from "@xstate/store/react";
import { LucideCloudUpload } from "lucide-react";
import Markdown from "react-markdown";
import useSWR from "swr";
import { localjudge } from "@/api/client";
import { $localjudge } from "@/api/fetch";
import { useTheme } from "@/components/theme-provider";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	SolutionStoreProvider,
	useSolutionStore,
} from "@/lib/client/solution-store";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/app/contest/$id/problem/$problem")({
	loader: async ({ params, abortController, context }) => {
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
					.testcase.get({ fetch: { signal: abortController.signal } }),
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
	const store = useSolutionStore();
	const value = useSelector(store, (state) => state.context.language);

	return (
		<Select
			value={value}
			onValueChange={(language) =>
				store.trigger.param({ key: "language", value: language })
			}
		>
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

	if (isLoading) return <Skeleton className="h-64" />;
	if (error || !data) return <div>Error: {JSON.stringify(error)}</div>;

	return (
		<>
			<span>Input: </span>
			<pre>
				<code>{data.input}</code>
			</pre>
			<Separator className="my-4" />
			<span>Expected Output: </span>
			<pre>
				<code>{data.output}</code>
			</pre>
		</>
	);
}

function TestcaseList() {
	const testcases = Route.useLoaderData({ select: (data) => data.testcases });

	return (
		<Tabs
			orientation="vertical"
			className="w-full flex-row items-start mt-2"
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
			<div className="grow pl-4">
				{testcases.map((tc) => (
					<TabsContent
						key={tc.number}
						value={tc.number.toString()}
						className="typography"
					>
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
	const [theme] = useTheme();
	const store = useSolutionStore();
	const language = useSelector(store, (state) => state.context.language);
	const file = useSelector(store, (state) => state.context.file);
	const value = useSelector(
		store,
		({ context: ctx }) =>
			ctx.solutions[ctx.problem]?.[ctx.language]?.[ctx.file] ?? "",
	);

	const throttledUpdate = useThrottledCallback(
		(content: string) => store.trigger.write({ content }),
		{
			wait: 500,
		},
	);

	return (
		<Editor
			theme={theme === "dark" ? "vs-dark" : "light"}
			language={language}
			path={file}
			value={value}
			onChange={(value) => throttledUpdate(value ?? "")}
			options={{
				folding: false,
				lineNumbers: "on",
				fontFamily: "'JetBrains Mono Variable', monospace",
				padding: {
					top: 8,
				},
				minimap: {
					enabled: false,
				},
			}}
		/>
	);
}

function RouteComponent() {
	return (
		<SolutionStoreProvider>
			<div className="flex shrink-0 h-14 items-center justify-between gap-2 border-b px-4">
				<div className="inline-flex items-center gap-2">
					<SidebarTrigger className="-ml-1" />
					Problems
				</div>
				<SubmitCode />
				<LanguageSelect />
			</div>
			<ResizablePanelGroup direction="horizontal" className="h-full">
				<ResizablePanel className="py-2 px-4">
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
		</SolutionStoreProvider>
	);
}
