import { Type } from "@sinclair/typebox";
import { Compile } from "@sinclair/typemap";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	retainSearchParams,
} from "@tanstack/react-router";
import {
	ColumnDef,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	LucideFileQuestionMark,
	LucideTableProperties,
	LucideUser,
} from "lucide-react";
import { useMemo, useState } from "react";
import { localjudge } from "@/api/client";
import { $localjudge } from "@/api/fetch";
import {
	DataTable,
	DataTableColumnHeader,
	DataTableColumnVisibility,
	DataTablePagination,
} from "@/components/data-table";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxPopup,
} from "@/components/ui/combobox";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
	validateSearch: Compile(
		Type.Object({
			contest: Type.Optional(Type.String()),
			problem: Type.Optional(Type.Number()),
			user: Type.Optional(Type.String()),
		}),
	),
	search: {
		middlewares: [retainSearchParams(["contest", "problem", "user"])],
	},
	component: RouteComponent,
});

function ContestSelector() {
	const { data, error, isLoading } = useQuery({
		queryKey: ["/api/admin/contest"] as const,
		queryFn: async ({ queryKey: [url] }) =>
			rejectError($localjudge(url, {})).then((data) =>
				data.map(({ id, name }) => ({ value: id, label: name })),
			),
	});
	const selected = Route.useSearch({ select: (params) => params.contest });
	const value = useMemo(
		() => data?.find(({ value }) => value === selected) ?? null,
		[data, selected],
	);
	const navigate = Route.useNavigate();

	if (isLoading) return <Skeleton className="h-8 w-full" />;

	if (error || data === undefined)
		return (
			<Alert variant="error">
				<AlertTitle>Error loading contests</AlertTitle>
				<AlertDescription>{JSON.stringify(error)}</AlertDescription>
			</Alert>
		);

	return (
		<Combobox
			items={data}
			value={value}
			onValueChange={(item) =>
				navigate({ search: { contest: item?.value, problem: undefined } })
			}
		>
			<InputGroup>
				<InputGroupAddon>
					<LucideTableProperties />
				</InputGroupAddon>
				<ComboboxInput
					placeholder="Select contest..."
					showClear
					render={<InputGroupInput />}
				/>
			</InputGroup>
			<ComboboxPopup>
				<ComboboxEmpty>No contests found.</ComboboxEmpty>
				<ComboboxList>
					{(item) => (
						<ComboboxItem key={item.value} value={item}>
							{item.label}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxPopup>
		</Combobox>
	);
}

function ProblemSelector() {
	const { contest, problem: selected } = Route.useSearch();
	const { data, isLoading, error } = useQuery({
		queryKey: ["/api/contest/:id/problem", { id: contest }] as const,
		queryFn: async ({ queryKey: [url, params] }) => {
			if (params.id === undefined) return [];
			return rejectError(
				localjudge.contest({ id: params.id! }).problem.get(),
			).then((data) =>
				data.map(({ number, title }) => ({
					value: number,
					label: `${number}. ${title}`,
				})),
			);
		},
	});
	const value = useMemo(
		() => data?.find(({ value }) => value === selected) ?? null,
		[data, selected],
	);
	const navigate = Route.useNavigate();

	if (isLoading) return <Skeleton className="h-8 w-full" />;

	if (error || data === undefined)
		return (
			<Alert variant="error">
				<AlertTitle>Error loading problems</AlertTitle>
				<AlertDescription>{JSON.stringify(error)}</AlertDescription>
			</Alert>
		);

	return (
		<Combobox
			items={data}
			value={value}
			onValueChange={(item) => navigate({ search: { problem: item?.value } })}
		>
			<InputGroup>
				<InputGroupAddon>
					<LucideFileQuestionMark />
				</InputGroupAddon>
				<ComboboxInput
					placeholder="Select problem..."
					showClear
					render={<InputGroupInput />}
				/>
			</InputGroup>
			<ComboboxPopup>
				<ComboboxEmpty>No problems found.</ComboboxEmpty>
				<ComboboxList>
					{(item) => (
						<ComboboxItem key={item.value} value={item}>
							{item.label}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxPopup>
		</Combobox>
	);
}

function UserSelector() {
	const selected = Route.useSearch({ select: (params) => params.user });
	const [search, setSearch] = useState("");
	const { data, isLoading, error } = useQuery({
		queryKey: ["users", search],
		queryFn: async () =>
			rejectError(
				authClient.admin.listUsers({
					query: {
						limit: 10,
						searchOperator: "contains",
						searchField: "email",
						searchValue: search,
					},
				}),
			)
				.then(({ users }) => users)
				.then((users) =>
					users.map((user) => ({
						label: user.name,
						value: user.id,
						email: user.email,
					})),
				),
		placeholderData: keepPreviousData,
	});
	const value = useMemo(
		() => data?.find(({ value }) => value === selected) ?? null,
		[data, selected],
	);
	const navigate = Route.useNavigate();

	if (isLoading) return <Skeleton className="h-8 w-full" />;

	if (error || data === undefined)
		return (
			<Alert variant="error">
				<AlertTitle>Error loading problems</AlertTitle>
				<AlertDescription>{JSON.stringify(error)}</AlertDescription>
			</Alert>
		);

	return (
		<Combobox
			items={data}
			filter={null}
			value={value}
			onValueChange={(item) => navigate({ search: { user: item?.value } })}
			onInputValueChange={(value: string) => setSearch(value)}
		>
			<InputGroup>
				<InputGroupAddon>
					<LucideUser />
				</InputGroupAddon>
				<ComboboxInput
					placeholder="Select user..."
					showClear
					render={<InputGroupInput />}
				/>
			</InputGroup>
			<ComboboxPopup>
				<ComboboxEmpty>No users found.</ComboboxEmpty>
				<ComboboxList>
					{(item) => (
						<ComboboxItem key={item.value} value={item}>
							<Item size="sm" className="w-full p-2">
								<ItemContent className="gap-0.5">
									<ItemTitle>{item.label}</ItemTitle>
									<ItemDescription>{item.email}</ItemDescription>
								</ItemContent>
							</Item>
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxPopup>
		</Combobox>
	);
}

function SubmissionsTable() {
	const params = Route.useSearch();
	const { data, isLoading, error } = useQuery({
		queryKey: ["/api/admin/submission", params] as const,
		queryFn: async ({ queryKey: [url, query] }) =>
			rejectError(
				$localjudge(url, {
					query,
				}),
			),
		placeholderData: keepPreviousData,
	});

	const columns: ColumnDef<NonNullable<typeof data>[number]>[] = useMemo(
		() => [
			{
				accessorKey: "user.name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} className="ms-0">
						User
					</DataTableColumnHeader>
				),
				cell: ({ getValue, row }) => (
					<Button
						variant="link"
						render={
							<Link
								to="/admin/user/$user"
								params={{ user: row.original.userId }}
							/>
						}
					>
						{getValue<string>()}
					</Button>
				),
			},
			{
				accessorKey: "contest.name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} className="ms-0">
						Contest
					</DataTableColumnHeader>
				),
				cell: ({ getValue, row }) => (
					<Button
						variant="link"
						render={
							<Link
								to="/admin/contest/$id"
								params={{ id: row.original.contestId }}
							/>
						}
					>
						{getValue<string>()}
					</Button>
				),
			},
			{
				accessorKey: "problem.title",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} className="ms-0">
						Problem
					</DataTableColumnHeader>
				),
				cell: ({ getValue, row }) => (
					<Button
						variant="link"
						render={
							<Link
								to="/admin/contest/$id/problem/$problem"
								params={{
									id: row.original.contestId,
									problem: row.original.problemNumber.toString(),
								}}
							/>
						}
					>
						{getValue<string>()}
					</Button>
				),
			},
			{
				id: "status",
				header: "Status",
				enableSorting: false,
				cell: ({ row }) => <SubmissionStatusBadge id={row.original.id} />,
			},
			{
				accessorKey: "language",
				header: ({ column }) => (
					<DataTableColumnHeader column={column}>
						Language
					</DataTableColumnHeader>
				),
			},
			{
				accessorKey: "createdAt",
				header: ({ column }) => (
					<DataTableColumnHeader column={column}>
						Submitted At
					</DataTableColumnHeader>
				),
				cell: ({ getValue }) => getValue<Date>().toLocaleString(),
			},
			{
				id: "link",
				enableSorting: false,
				enableHiding: false,
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
		data: data ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	if (isLoading) {
		return (
			<div>
				<div className="flex justify-between items-center">
					<Skeleton className="h-8 w-xs" />
					<Skeleton className="h-8 w-32" />
				</div>
				<br />
				<Skeleton className="h-64" />
			</div>
		);
	}

	if (error || data === undefined) {
		return (
			<Alert variant="error">
				<AlertTitle>Error loading submissions</AlertTitle>
				<AlertDescription>{JSON.stringify(error)}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center">
				<div>
					<DataTablePagination table={table} />
				</div>
				<DataTableColumnVisibility table={table} />
			</div>
			<br />
			<DataTable table={table} />
		</div>
	);
}

function RouteComponent() {
	return (
		<div>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Submissions
			</h1>
			<br />
			<div className="flex items-center gap-3">
				<UserSelector />
				<ContestSelector />
				<ProblemSelector />
			</div>
			<Separator className="my-6" />
			<SubmissionsTable />
		</div>
	);
}
