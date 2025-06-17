import { createFileRoute } from "@tanstack/react-router";
import { LucidePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/contest")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
					Contests
				</h1>
				<Button>
					<LucidePlus /> Create New
				</Button>
			</div>
			No contests
		</div>
	);
}
