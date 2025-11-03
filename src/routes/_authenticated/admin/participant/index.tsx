import { Value } from "@sinclair/typebox/value";
import { Compile } from "@sinclair/typemap";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	ClientOnly,
	createFileRoute,
	Link,
	useRouter,
} from "@tanstack/react-router";
import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	PaginationState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins";
import { parse as csvParse } from "csv/browser/esm/sync";
import {
	LucideCopy,
	LucideEdit,
	LucideFileUp,
	LucideMoreHorizontal,
	LucidePlus,
	LucideTrash,
} from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { ParticipantModel } from "@/api/models/participant";
import {
	DataTable,
	DataTableColumnVisibility,
	DataTablePagination,
} from "@/components/data-table";
import { useAppForm } from "@/components/form/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FieldSet } from "@/components/ui/field";
import {
	Frame,
	FrameFooter,
	FrameHeader,
	FramePanel,
} from "@/components/ui/frame";
import { Input } from "@/components/ui/input";
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

export const Route = createFileRoute("/_authenticated/admin/participant/")({
	component: RouteComponent,
});

function NewParticipantDialog() {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const form = useAppForm({
		defaultValues: Value.Create(ParticipantModel.insert),
		validators: {
			onChange: Compile(ParticipantModel.insert),
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
			<DialogContent>
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
									placeholder={
										ParticipantModel.insert.properties.name.examples?.[0]
									}
								/>
							)}
						</form.AppField>
						<form.AppField name="email">
							{(field) => (
								<field.TextField
									label="Email"
									placeholder={
										ParticipantModel.insert.properties.email.examples?.[0]
									}
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
			</DialogContent>
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
			<DialogContent>
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
			</DialogContent>
		</Dialog>
	);
}

function ParticipantsTable() {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 15,
	});

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const { data, error } = useQuery({
		queryKey: ["auth", "users", pagination],
		placeholderData: keepPreviousData,
		queryFn: async () =>
			rejectError(
				authClient.admin.listUsers({
					query: {
						limit: pagination.pageSize,
						offset: pagination.pageSize * pagination.pageIndex,
						sortBy: "createdAt",
						sortDirection: "desc",
					},
				}),
			),
	});

	const columns: ColumnDef<UserWithRole>[] = useMemo(
		() => [
			{
				header: "Name",
				accessorKey: "name",
			},
			{
				header: "Email",
				accessorKey: "email",
			},
			{
				header: "Role",
				accessorKey: "role",
				cell: ({ getValue }) => (
					<Badge>{getValue<UserWithRole["role"]>()?.toLocaleUpperCase()}</Badge>
				),
			},
			{
				header: "Onboarded on",
				accessorKey: "createdAt",
				cell: ({ getValue }) =>
					getValue<UserWithRole["createdAt"]>().toLocaleString(),
			},
			{
				id: "actions",
				enableHiding: false,
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
								<MenuItem>
									<LucideCopy /> Copy ID
								</MenuItem>
								<MenuItem
									render={
										<Link
											to="/admin/participant/$user"
											params={{ user: userId }}
										/>
									}
								>
									<LucideEdit />
									Edit
								</MenuItem>
								<MenuSeparator />

								<MenuItem variant="destructive">
									<LucideTrash />
									Delete
								</MenuItem>
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
		state: {
			pagination,
			columnVisibility,
		},
	});

	if (!data) {
		return null;
	}

	return (
		<div>
			<div className="flex items-center justify-end mb-4">
				<DataTableColumnVisibility table={table} />
			</div>
			<Frame>
				<FramePanel>
					<DataTable table={table} />
				</FramePanel>
				<FrameFooter>
					<DataTablePagination table={table} />
				</FrameFooter>
			</Frame>
		</div>
	);
}

function RouteComponent() {
	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
					Participants
				</h1>
				<div className="inline-flex gap-2">
					<NewParticipantDialog />
					<ImportParticipantsDialog />
				</div>
			</div>
			<Separator className="my-6" />
			<Suspense fallback={<Spinner className="mx-auto" />}>
				<ClientOnly>
					<ParticipantsTable />
				</ClientOnly>
			</Suspense>
		</>
	);
}
