import { createFileRoute, Navigate } from "@tanstack/react-router";
import { localjudge } from "@/api/client";

export const Route = createFileRoute("/app/contest/$contestId/problem/")({
	loader: async ({ context: { contest } }) => contest,
	component: RouteComponent,
});

function RouteComponent() {
	const problems = Route.useLoaderData({
		select: (data) => data.problems,
	});

	return (
		<Navigate
			from={Route.fullPath}
			to="./$problemId"
			params={{ problemId: problems[0].id }}
		/>
	);
}
