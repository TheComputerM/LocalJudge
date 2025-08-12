import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/contest/$id/submission/")({
	component: RouteComponent,
});

function Submissions() {
	return (
		<TableRow>
			<TableCell>Problem ID</TableCell>
			<TableCell>Problem Name</TableCell>
			<TableCell>
				<Badge>10 / 20</Badge>
			</TableCell>
			<TableCell>C++@10.0.0</TableCell>
			<TableCell>DateTime</TableCell>
		</TableRow>
	);
}

function RouteComponent() {
	return (
		<div className="container mx-auto p-4">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Your Submissions
			</h1>
			<Separator className="my-6" />
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Problem</TableHead>
						<TableHead>Passed</TableHead>
						<TableHead>Language</TableHead>
						<TableHead>When</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<Submissions />
				</TableBody>
			</Table>
		</div>
	);
}
