import Editor from "@monaco-editor/react";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { LucideCloudUpload } from "lucide-react";
import { Suspense } from "react";
import Markdown from "react-markdown";
import useSWR from "swr";
import { localjudge } from "@/api/client";
import { $localjudge } from "@/api/fetch";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
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
	const { data } = useSWR(
		`/api/contest/${id}/problem/${problem}/testcase/${number}`,
		() =>
			rejectError(
				$localjudge("/api/contest/:id/problem/:problem/testcase/:testcase", {
					params: {
						id,
						problem: Number.parseInt(problem),
						testcase: number,
					},
				}),
			),
		{
			suspense: true,
			fallbackData: {
				number,
				hidden: false,
				points: 25,
				input: "...",
				output: "...",
			},
		},
	);

	return (
		<>
			<div className="p-2 bg-muted rounded">
				<pre className="text-wrap max-h-48 overflow-y-auto">{data.input}</pre>
			</div>
			<div className="p-2 bg-muted rounded">
				<pre className="text-wrap max-h-48 overflow-y-auto">{data.output}</pre>
			</div>
		</>
	);
}

function TestcaseList() {
	const testcases = Route.useLoaderData({ select: (data) => data.testcases });

	return (
		<Accordion type="single" collapsible>
			{testcases.map((tc) => (
				<AccordionItem
					key={tc.number}
					value={tc.number.toString()}
					disabled={tc.hidden}
				>
					<AccordionTrigger className="mb-2">
						<div className="inline-flex items-center justify-between w-full">
							Testcase {tc.number}
							<Badge>{tc.points} points</Badge>
						</div>
					</AccordionTrigger>
					<AccordionContent className="grid grid-cols-2 gap-2 text-xs">
						<Suspense>
							<TestcaseContent number={tc.number} />
						</Suspense>
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}

function ProblemStatement() {
	const problem = Route.useLoaderData({
		select: (data) => data.problem,
	});
	return (
		<div className="typography my-2">
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
