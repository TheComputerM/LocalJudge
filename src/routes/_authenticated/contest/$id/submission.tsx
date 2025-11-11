import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { localjudge } from "@/api/client";
import { DataTable } from "@/components/data-table";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/contest/$id/submission")({
	loader: async ({ params }) => {
		const submissions = await rejectError(
			localjudge.contest({ id: params.id }).submission.get(),
		);
		return { submissions };
	},
	component: RouteComponent,
});

function Submissionstable() {
	const submissions = Route.useLoaderData({
		select: ({ submissions }) => submissions,
	});

	const columns: ColumnDef<(typeof submissions)[number]>[] = useMemo(
		() => [
			{
				accessorKey: "problemNumber",
				header: "#",
			},
			{
				accessorKey: "problem.title",
				header: "Problem",
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => <SubmissionStatusBadge id={row.original.id} />,
			},
			{
				accessorKey: "language",
				header: "Language",
			},
			{
				accessorKey: "createdAt",
				header: "When",
				cell: ({ getValue }) => getValue<Date>().toLocaleString(),
			},
			{
				id: "link",
				cell: ({ row }) => (
					<Button
						variant="link"
						render={
							<Link
								to="/app/submission/$id"
								params={{ id: row.original.id }}
								target="_blank"
							/>
						}
					>
						View
					</Button>
				),
			},
		],
		[],
	);

	const table = useReactTable({
		data: submissions,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return <DataTable table={table} />;
}

function RouteComponent() {
	return (
		<div className="container mx-auto p-4">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Your Submissions
			</h1>
			<Separator className="my-6" />
			<Submissionstable />
		</div>
	);
}
