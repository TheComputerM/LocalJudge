import { Value } from "@sinclair/typebox/value";
import { Compile } from "@sinclair/typemap";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	LucideEdit,
	LucideFileUp,
	LucidePlus,
	LucideTrash,
} from "lucide-react";
import { useState } from "react";
import { localjudge } from "@/api/client";
import { ParticipantModel } from "@/api/models/participant";
import { ConfirmActionDialog } from "@/components/confirm-action";
import { useAppForm } from "@/components/form/primitives";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/participant")({
	loader: async () => {
		const participants = await rejectError(localjudge.admin.participant.get());
		return { participants };
	},
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
			const { data, error } = await localjudge.admin.participant.post(value);
			if (error) {
				alert(`Error ${error.status}: ${error.value.message}`);
				return;
			}
			await router.invalidate({ filter: (route) => route.id === Route.id });
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					New <LucidePlus />
				</Button>
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
					<FieldGroup className="gap-4">
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
					</FieldGroup>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Close</Button>
						</DialogClose>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function ImportParticipantsDialog() {
	async function handleSubmit(formdata: FormData) {}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					Import <LucideFileUp />
				</Button>
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
						<DialogClose asChild>
							<Button variant="outline">Close</Button>
						</DialogClose>
						<Button type="submit">Import</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function ParticipantsTable() {
	const users = Route.useLoaderData({
		select: ({ participants }) => participants,
	});
	const columns: ColumnDef<(typeof users)[number]>[] = [
		{
			accessorKey: "name",
			header: "Name",
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "createdAt",
			header: "Created At",
			cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
		},
		{
			header: "Actions",
			cell: ({ row }) => (
				<ButtonGroup>
					<ConfirmActionDialog>
						<Button variant="destructive" size="icon">
							<LucideTrash />
						</Button>
					</ConfirmActionDialog>
					<Button size="icon">
						<LucideEdit />
					</Button>
				</ButtonGroup>
			),
		},
	];
	const table = useReactTable({
		data: users,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No participants found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

function RouteComponent() {
	const users = Route.useLoaderData({
		select: ({ participants }) => participants,
	});
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
			<ParticipantsTable />
		</>
	);
}
