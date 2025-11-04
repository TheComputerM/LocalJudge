import { createFileRoute, Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { localjudge } from "@/api/client";
import DataTable from "@/components/data-table/table";
import { StatsGrid } from "@/components/stats-grid";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Button } from "@/components/ui/button";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";
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

	const columns: ColumnDef<(typeof data)[number]>[] = [
		{
			accessorKey: "user.name",
			header: "User",
			cell: ({ row, getValue }) => (
				<Link
					to="/admin/participant/$user"
					params={{ user: row.original.userId }}
				>
					{getValue<string>()}
				</Link>
			),
		},
		{
			accessorKey: "contest.name",
			header: "Contest",
			cell: ({ row, getValue }) => (
				<Link to="/admin/contest/$id" params={{ id: row.original.contestId }}>
					{getValue<string>()}
				</Link>
			),
		},
		{
			accessorKey: "problem.title",
			header: "Problem",
			cell: ({ row, getValue }) => (
				<Link
					to="/admin/contest/$id/problem/$problem"
					params={{
						id: row.original.contestId,
						problem: row.original.problemNumber.toString(),
					}}
				>
					{getValue<string>()}
				</Link>
			),
		},
		{
			accessorKey: "language",
			header: "Language",
		},
		{
			accessorKey: "id",
			header: "Status",
			cell: (info) => <SubmissionStatusBadge id={info.getValue() as string} />,
		},
		{
			accessorKey: "createdAt",
			header: "Time",
			cell: ({ getValue }) => getValue<Date>().toLocaleString(),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<Button
					variant="link"
					render={
						<Link to="/app/submission/$id" params={{ id: row.original.id }} />
					}
				>
					View
				</Button>
			),
		},
	];

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<Frame>
			<FrameHeader>
				<FrameTitle>Recent Submissions</FrameTitle>
			</FrameHeader>
			<FramePanel>
				<DataTable table={table} />
			</FramePanel>
		</Frame>
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
			<RecentSubmissions />
		</div>
	);
}
