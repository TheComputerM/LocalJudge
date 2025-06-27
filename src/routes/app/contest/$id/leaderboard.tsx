import { createFileRoute } from "@tanstack/react-router";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/app/contest/$id/leaderboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto p-4">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">Rank</TableHead>
						<TableHead>Participant</TableHead>
						<TableHead>Score</TableHead>
					</TableRow>
				</TableHeader>
			</Table>
		</div>
	);
}
