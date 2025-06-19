import { createFileRoute } from "@tanstack/react-router";
import { LucideCloudUpload, LucidePlay } from "lucide-react";
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

function Content() {
	return (
		<ResizablePanelGroup direction="horizontal" className="h-full">
			<ResizablePanel>Problem Statement</ResizablePanel>
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
