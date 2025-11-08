import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ColumnDef,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { localjudge } from "@/api/client";
import { DataTable, DataTableColumnHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute(
	"/_authenticated/admin/contest/$id/participant/",
)({
	loader: async ({ params }) => {
		const participants = await rejectError(
			localjudge.admin.contest({ id: params.id }).participant.get(),
		);
		return participants;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const participants = Route.useLoaderData();
	const contestId = Route.useParams({ select: (params) => params.id });
	const columns: ColumnDef<(typeof participants)[number]>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column}>Name</DataTableColumnHeader>
				),
			},
			{
				accessorKey: "email",
				header: ({ column }) => (
					<DataTableColumnHeader column={column}>Email</DataTableColumnHeader>
				),
			},
			{
				accessorKey: "submissions",
				header: ({ column }) => (
					<DataTableColumnHeader column={column}>
						Submissions
					</DataTableColumnHeader>
				),
			},
			{
				id: "submissionsLink",
				enableHiding: false,
				enableSorting: false,
				cell: ({ row }) => (
					<Button
						variant="link"
						render={
							<Link
								to="/admin/submissions"
								search={{ user: row.original.id, contest: contestId }}
							/>
						}
					>
						Submissions
					</Button>
				),
			},
			{
				id: "timeline",
				enableHiding: false,
				enableSorting: false,
				cell: ({ row }) => (
					<Button
						variant="link"
						render={
							<Link
								from={Route.fullPath}
								to="./$participant/timeline"
								params={{ participant: row.original.id }}
							/>
						}
					>
						Timeline
					</Button>
				),
			},
			{
				id: "profile",
				enableHiding: false,
				enableSorting: false,
				cell: ({ row }) => (
					<Button
						variant="link"
						render={
							<Link to="/admin/user/$user" params={{ user: row.original.id }} />
						}
					>
						Profile
					</Button>
				),
			},
		],
		[contestId],
	);

	const table = useReactTable({
		data: participants,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	return (
		<div>
			<DataTable table={table} />
		</div>
	);
}
