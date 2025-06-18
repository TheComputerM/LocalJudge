import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin/contest/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Create New Contest
			</h1>
			<Separator className="my-8" />
		</div>
	);
}
