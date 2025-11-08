import { Column, SortDirection } from "@tanstack/react-table";
import {
	LucideChevronDown,
	LucideChevronsUpDown,
	LucideChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "../ui/menu";

function SortIcon({ direction }: { direction: SortDirection | false }) {
	if (direction === "asc") return <LucideChevronUp />;
	if (direction === "desc") return <LucideChevronDown />;
	return <LucideChevronsUpDown />;
}

export default function DataTableColumnHeader<TData, TValue>({
	column,
	children,
	className,
}: {
	column: Column<TData, TValue>;
	children: React.ReactNode;
	className?: string;
}) {
	if (!column.getCanSort()) {
		return (
			<Button
				size="sm"
				variant="ghost"
				className={cn("-ms-2.5 cursor-default", className)}
			>
				{children}
			</Button>
		);
	}
	return (
		<Menu>
			<MenuTrigger
				render={
					<Button
						size="sm"
						variant="ghost"
						className={cn("-ms-2.5", className)}
					/>
				}
			>
				{children}
				<SortIcon direction={column.getIsSorted()} />
			</MenuTrigger>
			<MenuPopup align="start">
				<MenuItem onClick={() => column.toggleSorting(false)}>
					<LucideChevronUp /> Asc
				</MenuItem>

				<MenuItem onClick={() => column.toggleSorting(true)}>
					<LucideChevronDown /> Desc
				</MenuItem>

				<MenuItem onClick={() => column.clearSorting()}>
					<LucideChevronsUpDown /> Reset
				</MenuItem>
			</MenuPopup>
		</Menu>
	);
}
