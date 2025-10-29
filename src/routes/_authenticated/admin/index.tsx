import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { StatsGrid } from "@/components/stats-grid";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/")({
	loader: async ({ abortController }) => {
		const overview = await rejectError(
			localjudge.admin.overview.get({
				fetch: {
					signal: abortController.signal,
				},
			}),
		);
		return overview;
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
			<StatsGrid
				data={Object.entries(data.statistics).map(([name, value]) => ({
					name: name.charAt(0).toUpperCase() + name.slice(1),
					value: value.toString(),
				}))}
			/>
		</div>
	);
}
