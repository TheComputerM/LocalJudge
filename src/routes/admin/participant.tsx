import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/participant")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/admin/participant"!</div>;
}
