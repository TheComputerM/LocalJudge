import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/contest/$contestId/problem/")({
	loader: async ({ context: { contest } }) => contest,
	component: RouteComponent,
});

function RouteComponent() {
	const problems = Route.useLoaderData({ select: (data) => data.problems });

	return (
		<Navigate
			from={Route.fullPath}
			to="./$number"
			params={{ number: problems[0].index.toString() }}
		/>
	);
}
