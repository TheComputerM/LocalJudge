import { Table } from "@tanstack/react-table";
import { LucideEyeOff } from "lucide-react";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Select, SelectItem, SelectPopup, SelectTrigger } from "../ui/select";

export default function DataTableColumnVisibility<TData>({
	table,
}: {
	table: Table<TData>;
}) {
	const columns = useMemo(
		() => table.getAllColumns().filter((column) => column.getCanHide()),
		[table],
	);

	return (
		<Select
			multiple
			value={columns
				.filter((column) => column.getIsVisible())
				.map((column) => column.id)}
			onValueChange={(value: string[]) => {
				const data = Object.fromEntries(
					columns.map((column) => [column.id, false]),
				);
				for (const id of value) {
					data[id] = true;
				}
				table.setColumnVisibility(data);
			}}
		>
			<SelectTrigger
				className="min-w-auto w-fit"
				render={
					<Button variant="outline">
						<LucideEyeOff />
						Columns
					</Button>
				}
			/>
			<SelectPopup alignItemWithTrigger={false} align="end">
				{columns.map((column) => (
					<SelectItem key={column.id} value={column.id} className="capitalize">
						{column.id}
					</SelectItem>
				))}
			</SelectPopup>
		</Select>
	);
}
