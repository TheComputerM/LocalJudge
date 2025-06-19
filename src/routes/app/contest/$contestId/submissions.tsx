import { createFileRoute } from "@tanstack/react-router";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/app/contest/$contestId/submissions")({
	component: RouteComponent,
});

function Submissions() {
	return (
		<Accordion
			type="single"
			collapsible
			className="w-full space-y-2"
			defaultValue="1"
		>
			<AccordionItem
				value="1"
				className="bg-background has-focus-visible:border-ring has-focus-visible:ring-ring/50 rounded-md border px-4 py-1 outline-none last:border-b has-focus-visible:ring-[3px]"
			>
				<AccordionTrigger className="py-2 text-[15px] leading-6 hover:no-underline focus-visible:ring-0">
					<div>
						Submission #1
						<span className="ml-2 text-muted-foreground">(problem name)</span>
					</div>
				</AccordionTrigger>
				<AccordionContent className="pb-2">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-32">Id</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
					</Table>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

function RouteComponent() {
	return (
		<div className="container mx-auto p-4">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Your Submissions
			</h1>
			<Separator className="my-8" />
			<Submissions />
		</div>
	);
}
