import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/configuration")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Server Configuration
			</h1>
		</div>
	);
}
