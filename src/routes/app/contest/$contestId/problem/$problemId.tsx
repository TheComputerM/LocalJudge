import { createFileRoute } from "@tanstack/react-router";
import { LucideCloudUpload } from "lucide-react";
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

export const Route = createFileRoute(
	"/app/contest/$contestId/problem/$problemId",
)({
	component: RouteComponent,
});

function SubmitCode() {
	return (
		<Button variant="outline">
			<LucideCloudUpload />
			Submit
		</Button>
	);
}

function LanguageSelect() {
	return (
		<Select>
			<SelectTrigger className="w-32">
				<SelectValue placeholder="Language" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="c++">C++</SelectItem>
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
						<pre className="text-wrap text-wrap max-h-48 overflow-y-auto">
							Input
						</pre>
					</div>
					<div className="p-2 bg-muted rounded flex-1">
						<pre className="text-wrap max-h-48 overflow-y-auto">Output</pre>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
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
					<TabsContent value="statement">TODO:</TabsContent>
					<TabsContent value="testcases">
						<TestcaseList />
					</TabsContent>
				</Tabs>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel>Editor</ResizablePanel>
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
