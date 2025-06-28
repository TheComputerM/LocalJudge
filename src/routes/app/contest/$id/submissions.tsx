import { createFileRoute } from "@tanstack/react-router";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/contest/$id/submissions")({
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
					<div className="inline-flex items-center gap-2">
						Problem Name
						<span className="text-muted-foreground">(#1)</span>
					</div>
				</AccordionTrigger>
				<AccordionContent className="pb-2">
					TODO: testcase badges in a grid
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
