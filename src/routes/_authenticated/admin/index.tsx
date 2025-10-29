import { createFileRoute, Link } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { StatsGrid } from "@/components/stats-grid";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { rejectError } from "@/lib/utils";

// TODO: refresh route data after 1s repeatedly
export const Route = createFileRoute("/_authenticated/admin/")({
	loader: async ({ abortController }) => {
		const [overview, submissions] = await Promise.all([
			rejectError(
				localjudge.admin.overview.get({
					fetch: {
						signal: abortController.signal,
					},
				}),
			),
			rejectError(
				localjudge.admin.submission.get({
					query: {
						page: 1,
						pageSize: 20,
					},
				}),
			),
		]);
		return { overview, submissions };
	},
	component: RouteComponent,
});

function RecentSubmissions() {
	const data = Route.useLoaderData({
		select: ({ submissions }) => submissions,
	});

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>By</TableHead>
					<TableHead>Contest</TableHead>
					<TableHead>Problem</TableHead>
					<TableHead>Language</TableHead>
					<TableHead>Time</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((submission) => (
					<TableRow key={submission.id}>
						<TableCell>{submission.user.name}</TableCell>
						<TableCell>
							<Link
								to="/admin/contest/$id"
								params={{ id: submission.contestId }}
							>
								{submission.contest.name}
							</Link>
						</TableCell>
						<TableCell>
							<Link
								to="/admin/contest/$id/problem/$problem"
								params={{
									id: submission.contestId,
									problem: submission.problemNumber.toString(),
								}}
							>
								{submission.problem.title}
							</Link>
						</TableCell>
						<TableCell>{submission.language}</TableCell>
						<TableCell>{submission.createdAt.toLocaleString()}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function RouteComponent() {
	const overview = Route.useLoaderData({ select: ({ overview }) => overview });

	return (
		<div>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Admin Dashboard
			</h1>
			<br />
			<StatsGrid
				data={Object.entries(overview.statistics).map(([name, value]) => ({
					name: name.charAt(0).toUpperCase() + name.slice(1),
					value: value.toString(),
				}))}
			/>
			<br />
			<h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
				Recent Submissions
			</h2>
			<br />
			<RecentSubmissions />
		</div>
	);
}
