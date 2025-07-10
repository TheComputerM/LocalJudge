import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/app/contest/$id/leaderboard")({
	beforeLoad: ({ context }) => {
		if (!context.contest.settings.leaderboard) {
			throw new Error("viewing the leaderboard is disabled for this contest");
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto p-4">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Leaderboard
			</h1>
			<Separator className="my-6" />
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
