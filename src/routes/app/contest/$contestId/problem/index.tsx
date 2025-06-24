import { createFileRoute, Navigate } from "@tanstack/react-router";
import { localjudge } from "@/api/client";

export const Route = createFileRoute("/app/contest/$contestId/problem/")({
	loader: async ({ params }) => {
		// TODO: pass contest data through context
		const { data: contestData, error } = await localjudge.api
			.contest({ contestId: params.contestId })
			.get();
		if (error) throw error;

		return { contest: contestData };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const problems = Route.useLoaderData({
		select: (data) => data.contest.problems,
	});

	return (
		<Navigate
			from={Route.fullPath}
			to="./$problemId"
			params={{ problemId: problems[0].id }}
		/>
	);
}
