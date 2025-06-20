import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/admin/")({
	loader: async () => {
		const { data } = await localjudge.api.admin.dashboard.get();
		if (!data) {
			throw new Error("Failed to fetch admin dashboard data");
		}
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
						<CardDescription>Perticipants</CardDescription>
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
