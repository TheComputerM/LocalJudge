import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
	loader: async ({ abortController }) => {
		const { data, error } = await localjudge.api.admin.overview.get({
			fetch: {
				signal: abortController.signal,
			},
		});
		if (error) throw error;
		return data;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();
	return (
		<div>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Admin Dashboard
			</h1>
			<br />
			<div className="grid sm:grid-cols-3 gap-3">
				<Card>
					<CardHeader className="px-6">
						<CardDescription>Contests</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums">
							{data.statistics.contests}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="px-6">
						<CardDescription>Participants</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums">
							{data.statistics.participants}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="px-6">
						<CardDescription>Submissions</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums">
							{data.statistics.submissions}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>
		</div>
	);
}
