import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/contest/$contestId/problem/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Navigate
			from={Route.fullPath}
			to="./$problemId"
			params={{ problemId: "1" }}
		/>
	);
}
