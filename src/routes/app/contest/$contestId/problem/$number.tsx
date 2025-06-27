import Editor from "@monaco-editor/react";
import { createFileRoute } from "@tanstack/react-router";
import { LucideCloudUpload } from "lucide-react";
import Markdown from "react-markdown";
import { localjudge } from "@/api/client";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
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

export const Route = createFileRoute("/app/contest/$contestId/problem/$number")(
	{
		loader: async ({ params, abortController }) => {
			const problem = await rejectError(
				localjudge.api
					.contest({ contestId: params.contestId })
					.problem({ index: params.number })
					.get({ fetch: { signal: abortController.signal } }),
			);

			return { problem };
		},
		component: RouteComponent,
	},
);

function SubmitCode() {
	const { contestId, number } = Route.useParams();
	async function handleSubmit() {
		const { data, error } = await localjudge.api
			.contest({ contestId })
			.problem({ index: number })
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
	return (
		<Select defaultValue="cpp">
			<SelectTrigger className="w-32">
				<SelectValue placeholder="Language" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="cpp">C++</SelectItem>
				<SelectItem value="java">Java</SelectItem>
				<SelectItem value="dart">Dart</SelectItem>
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

function TestcaseList() {
	return (
		<Accordion type="single" collapsible>
			<AccordionItem value="t1">
				<AccordionTrigger>Testcase 1</AccordionTrigger>
				<AccordionContent className="grid grid-cols-2 gap-2 text-xs">
					<div className="p-2 bg-muted rounded flex-1">
						<pre className="text-wrap max-h-48 overflow-y-auto">Input</pre>
					</div>
					<div className="p-2 bg-muted rounded flex-1">
						<pre className="text-wrap max-h-48 overflow-y-auto">Output</pre>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

function ProblemStatement() {
	const problem = Route.useLoaderData({
		select: (data) => data.problem,
	});
	return (
		<>
			<h1 className="scroll-m-20 text-2xl font-semibold tracking-tight">
				{problem.title}
			</h1>
			<Markdown>{problem.description}</Markdown>
		</>
	);
}

function CodeEditor() {
	const problemIndex = Route.useParams({ select: (params) => params.number });

	return (
		<Editor
			defaultLanguage="cpp"
			theme="vs-dark"
			options={{
				folding: false,
				lineNumbers: "off",
				fontFamily: "'JetBrains Mono Variable'",
			}}
			defaultValue={`
#include <bits/stdc++.h>
int main() {
	cout << "Hello" << "\\n";
	return 0;
}	
			`.trim()}
			onChange={(value) => {
				sessionStorage.setItem(`code:${problemIndex}`, value ?? "");
			}}
		/>
	);
}

function Content() {
	return (
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
	);
}

function RouteComponent() {
	return (
		<>
			<Navbar />
			<Content />
		</>
	);
}
