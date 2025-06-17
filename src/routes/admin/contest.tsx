import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/contest")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/admin/contest"!</div>;
}
