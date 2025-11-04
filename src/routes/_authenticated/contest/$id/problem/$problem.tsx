import Editor from "@monaco-editor/react";
import { useThrottledCallback } from "@tanstack/react-pacer/throttler";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { LucideCloudUpload } from "lucide-react";
import Markdown from "react-markdown";
import { localjudge } from "@/api/client";
import { $localjudge } from "@/api/fetch";
import { BufferTextBlock } from "@/components/buffer-text-block";
import { useTheme } from "@/components/providers/theme";
import { Button } from "@/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toastManager } from "@/components/ui/toast";
import {
	SolutionStoreProvider,
	useSolutionStore,
} from "@/lib/client/solution-store";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute(
	"/_authenticated/contest/$id/problem/$problem",
)({
	loader: async ({ params, abortController, context }) => {
		const [problem, testcases] = await Promise.all([
			rejectError(
				localjudge
					.contest({ id: params.id })
					.problem({ problem: params.problem })
					.get({ fetch: { signal: abortController.signal } }),
			),
			rejectError(
				localjudge
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
	const store = useSolutionStore();
	const testcasesCount = Route.useLoaderData({
		select: (data) => data.testcases.length,
	});

	async function handleSubmit() {
		const { data: results, error } = await localjudge
			.contest({ id })
			.problem({ problem })
			.submit({ language: store.selected.state.language })
			.post(store.content.state);

		if (error) {
			toastManager.add({
				title: "Submission failed",
				description: JSON.stringify(error),
				type: "error",
			});
			return;
		}

		const toastId = toastManager.add({
			title: "Submission in progress...",
			type: "info",
		});
		let passed = 0;
		let failed = 0;
		for await (const { data } of results) {
			if (data.status === "CA") {
				passed += 1;
			} else {
				failed += 1;
			}
			toastManager.update(toastId, {
				title: `${passed} / ${passed + failed} testcases till now`,
				type: "loading",
			});
		}
		toastManager.update(toastId, {
			title: `${passed} / ${passed + failed} testcases`,
			type: failed === 0 ? "success" : "error",
		});
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
		from: "/_authenticated/contest/$id",
		select: (data) => data.settings.languages,
	});
	const { selected } = useSolutionStore();
	const value = useStore(selected, (state) => state.language);

	return (
		<Select
			value={value}
			onValueChange={(language) =>
				selected.setState((prev) => ({ ...prev, language }))
			}
		>
			<SelectTrigger className="min-w-auto w-min">
				<SelectValue />
			</SelectTrigger>
			<SelectPopup>
				{languages.map((lang) => (
					<SelectItem key={lang} value={lang}>
						{lang}
					</SelectItem>
				))}
			</SelectPopup>
		</Select>
	);
}

function TestcaseContent({ number }: { number: number }) {
	const { id, problem } = Route.useParams();
	const { data, error, isLoading } = useQuery({
		queryKey: [
			"/api/contest/:id/problem/:problem/testcase/:testcase",
			{ id, problem: Number.parseInt(problem), testcase: number },
		] as const,
		queryFn: async ({ queryKey: [url, params] }) =>
			rejectError($localjudge(url, { method: "GET", params })),
		staleTime: Number.POSITIVE_INFINITY,
	});

	if (isLoading) return <Skeleton className="h-64" />;
	if (error || !data) return <div>Error: {JSON.stringify(error)}</div>;

	return (
		<>
			<BufferTextBlock label="Input">{data.input}</BufferTextBlock>
			<Separator className="my-4" />
			<BufferTextBlock label="Expected Output">{data.output}</BufferTextBlock>
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
					<TabsContent key={tc.number} value={tc.number.toString()}>
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
		<div className="prose prose-neutral dark:prose-invert">
			<h1>{problem.title}</h1>
			<Markdown>{problem.description}</Markdown>
		</div>
	);
}

function CodeEditor() {
	const [theme] = useTheme();
	const store = useSolutionStore();
	const language = useStore(store.selected, (state) => state.language);
	const path = useStore(
		store.selected,
		(state) => `${state.problem}/${state.language}`,
	);
	const value = useStore(store.content);

	const throttledUpdate = useThrottledCallback(store.setContent, {
		wait: 500,
	});

	return (
		<Editor
			theme={theme === "dark" ? "vs-dark" : "light"}
			language={language}
			path={path}
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
