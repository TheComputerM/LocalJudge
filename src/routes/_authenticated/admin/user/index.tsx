import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { Compile } from "@sinclair/typemap";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	PaginationState,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins";
import { parse as csvParse } from "csv/browser/esm/sync";
import {
	LucideCopy,
	LucideEye,
	LucideFileUp,
	LucideMoreHorizontal,
	LucidePlus,
	LucideSearch,
	LucideTrash,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmActionDialog } from "@/components/confirm-action";
import {
	DataTable,
	DataTableColumnHeader,
	DataTableColumnVisibility,
	DataTablePagination,
} from "@/components/data-table";
import { useAppForm } from "@/components/form/primitives";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Menu,
	MenuItem,
	MenuPopup,
	MenuSeparator,
	MenuTrigger,
} from "@/components/ui/menu";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/lib/auth/client";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/user/")({
	component: RouteComponent,
});

const UserModel = Type.Object({
	name: Type.String({ title: "Name", examples: ["John Doe"] }),
	email: Type.String({
		title: "Email",
		format: "email",
		default: "",
		examples: ["a@example.com"],
	}),
	password: Type.String({ title: "Password" }),
});

function NewParticipantDialog() {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const form = useAppForm({
		defaultValues: Value.Create(UserModel),
		validators: {
			onChange: Compile(UserModel),
		},
		onSubmit: async ({ value }) => {
			const { error } = await authClient.admin.createUser({
				name: value.name,
				email: value.email,
				password: value.password,
				role: "user",
			});
			if (error) {
				toastManager.add({
					title: "User create failed",
					description: error.message,
					type: "error",
				});
				return;
			}
			await router.invalidate({ filter: (route) => route.id === Route.id });
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button variant="outline" />}>
				New <LucidePlus />
			</DialogTrigger>
			<DialogPopup>
				<DialogHeader>
					<DialogTitle>Create New Participant</DialogTitle>
					<DialogDescription>
						Fill in the details to create a new participant.
					</DialogDescription>
				</DialogHeader>
				<form
					className="contents"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<FieldSet>
						<form.AppField name="name">
							{(field) => (
								<field.TextField
									label="Name"
									placeholder={UserModel.properties.name.examples?.[0]}
								/>
							)}
						</form.AppField>
						<form.AppField name="email">
							{(field) => (
								<field.TextField
									label="Email"
									placeholder={UserModel.properties.email.examples?.[0]}
									type="email"
								/>
							)}
						</form.AppField>
						<form.AppField name="password">
							{(field) => <field.TextField label="Password" type="password" />}
						</form.AppField>
					</FieldSet>
					<DialogFooter>
						<DialogClose render={<Button variant="outline" />}>
							Close
						</DialogClose>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogPopup>
		</Dialog>
	);
}

function ImportParticipantsDialog() {
	const router = useRouter();
	async function handleSubmit(formdata: FormData) {
		const file = formdata.get("file") as File;
		if (!file) {
			toastManager.add({
				title: "No file selected",
				type: "error",
			});
			return;
		}
		const records: { name: string; email: string; password: string }[] =
			csvParse(await file.text(), {
				bom: true,
				columns: ["name", "email", "password"],
			});
		let errorCount = 0;
		for (const record of records) {
			const { error } = await authClient.admin.createUser({
				name: record.name,
				email: record.email,
				password: record.password,
				role: "user",
			});
			if (error) {
				errorCount++;
			}
		}
		toastManager.add({
			title: "Import completed",
			description: `Imported ${records.length - errorCount} out of ${records.length} entries`,
			type: errorCount === 0 ? "success" : "warning",
		});
		await router.invalidate({ filter: (r) => r.id === Route.id });
	}

	return (
		<Dialog>
			<DialogTrigger render={<Button />}>
				Import <LucideFileUp />
			</DialogTrigger>
			<DialogPopup>
				<DialogHeader>
					<DialogTitle>Import Participants</DialogTitle>
					<DialogDescription>
						Upload a CSV file with columns: <b>name, email, password</b>. Each
						row represents a participant to be imported.
					</DialogDescription>
				</DialogHeader>
				<form className="contents" action={handleSubmit}>
					<Input type="file" name="file" accept=".csv" />
					<DialogFooter>
						<DialogClose render={<Button variant="outline" />}>
							Close
						</DialogClose>
						<Button type="submit">Import</Button>
					</DialogFooter>
				</form>
			</DialogPopup>
		</Dialog>
	);
}

function ParticipantsTable() {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 15,
	});
	const [search, setSearch] = useState("");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "createdAt", desc: true },
	]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const { data, error, isLoading } = useQuery({
		queryKey: ["users", search, pagination, sorting],
		placeholderData: keepPreviousData,
		queryFn: async () =>
			rejectError(
				authClient.admin.listUsers({
					query: {
						limit: pagination.pageSize,
						offset: pagination.pageSize * pagination.pageIndex,
						searchOperator: "contains",
						searchValue: search,
						searchField: "email",
						sortBy: sorting[0]?.id,
						sortDirection: sorting[0]
							? sorting[0].desc
								? "desc"
								: "asc"
							: undefined,
					},
				}),
			),
	});

	const columns: ColumnDef<UserWithRole>[] = useMemo(
		() => [
			{
				accessorKey: "name",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} className="ms-0">
						Name
					</DataTableColumnHeader>
				),
				cell: ({ getValue, row }) => (
					<Button
						variant="link"
						render={
							<Link to="/admin/user/$user" params={{ user: row.original.id }} />
						}
					>
						{getValue<string>()}
					</Button>
				),
			},
			{
				accessorKey: "email",
				header: ({ column }) => (
					<DataTableColumnHeader column={column}>Email</DataTableColumnHeader>
				),
			},
			{
				header: "Role",
				accessorKey: "role",
				cell: ({ getValue }) => (
					<Badge>{getValue<UserWithRole["role"]>()}</Badge>
				),
			},
			{
				accessorKey: "createdAt",
				cell: ({ getValue }) =>
					getValue<UserWithRole["createdAt"]>().toLocaleString(),
				header: ({ column }) => (
					<DataTableColumnHeader column={column}>
						Created at
					</DataTableColumnHeader>
				),
			},
			{
				id: "actions",
				enableHiding: false,
				enableSorting: false,
				cell: ({ row }) => {
					const userId = row.original.id;
					return (
						<Menu>
							<MenuTrigger
								render={<Button variant="ghost" className="h-8 w-8 p-0" />}
							>
								<span className="sr-only">Open menu</span>
								<LucideMoreHorizontal />
							</MenuTrigger>
							<MenuPopup align="end">
								<MenuItem onClick={() => navigator.clipboard.writeText(userId)}>
									<LucideCopy /> Copy ID
								</MenuItem>
								<MenuItem
									render={
										<Link to="/admin/user/$user" params={{ user: userId }} />
									}
								>
									<LucideEye />
									View
								</MenuItem>
								<MenuSeparator />
								<ConfirmActionDialog
									onConfirm={async () => {
										await rejectError(
											authClient.admin.removeUser({
												userId,
											}),
										);
									}}
									nativeButton={false}
									trigger={
										<MenuItem variant="destructive" closeOnClick={false}>
											<LucideTrash />
											Delete
										</MenuItem>
									}
								/>
							</MenuPopup>
						</Menu>
					);
				},
			},
		],
		[],
	);

	const table = useReactTable({
		data: data?.users ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		rowCount: data?.total,
		onPaginationChange: setPagination,
		manualPagination: true,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		manualFiltering: true,
		manualSorting: true,
		onSortingChange: setSorting,
		state: {
			pagination,
			columnVisibility,
			sorting,
		},
	});

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Spinner />
			</div>
		);
	}

	if (error || !data) {
		return (
			<Alert variant="error">
				<AlertTitle>Failed to load participants</AlertTitle>
				<AlertDescription>{JSON.stringify(error)}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<InputGroup className="max-w-xs">
					<InputGroupInput
						placeholder="Search emails..."
						className="max-w-xs"
						value={search}
						onValueChange={(value) => setSearch(value)}
					/>
					<InputGroupAddon>
						<LucideSearch />
					</InputGroupAddon>
				</InputGroup>
				<DataTableColumnVisibility table={table} />
			</div>
			<DataTable table={table} />

			<DataTablePagination table={table} />
		</div>
	);
}

function RouteComponent() {
	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
					Users
				</h1>
				<div className="inline-flex gap-2">
					<NewParticipantDialog />
					<ImportParticipantsDialog />
				</div>
			</div>
			<Separator className="my-6" />
			<ParticipantsTable />
		</>
	);
}
