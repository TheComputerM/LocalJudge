import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/configuration")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/admin/configuration"!</div>;
}
