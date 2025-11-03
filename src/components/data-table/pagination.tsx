import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import { Button } from "../ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "../ui/pagination";
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

export default function DataTablePagination<TData>({
	table,
}: {
	table: Table<TData>;
}) {
	const ranges = useMemo(() => {
		const totalPages = table.getPageCount();
		const pageSize = table.getState().pagination.pageSize;
		return Array.from({ length: totalPages }, (_, i) => ({
			value: i,
			label: `${i * pageSize + 1}-${(i + 1) * pageSize}`,
		}));
	}, [table]);

	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex items-center gap-1.5 whitespace-nowrap text-sm">
				<span className="text-muted-foreground">Viewing</span>
				<Select
					value={table.getState().pagination.pageIndex}
					items={ranges}
					onValueChange={(value) => {
						table.setPageIndex(value);
					}}
				>
					<SelectTrigger
						className="min-w-none w-fit"
						size="sm"
						aria-label="Select result range"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectPopup>
						{ranges.map(({ label, value }) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectPopup>
				</Select>
			</div>
			<div>
				<Pagination>
					<PaginationContent className="w-full justify-between gap-2">
						<PaginationItem>
							<PaginationPrevious
								className="sm:*:[svg]:hidden"
								render={
									<Button
										variant="outline"
										size="sm"
										disabled={!table.getCanPreviousPage()}
										onClick={() => table.previousPage()}
									/>
								}
							/>
						</PaginationItem>
						<PaginationItem>
							<PaginationNext
								className="sm:*:[svg]:hidden"
								render={
									<Button
										variant="outline"
										size="sm"
										disabled={!table.getCanNextPage()}
										onClick={() => table.nextPage()}
									/>
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
