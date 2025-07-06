import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/contest/$id/problem/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/admin/contest/$id/problem/new"!</div>;
}
