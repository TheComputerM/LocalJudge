import { createFileRoute, Link } from "@tanstack/react-router";
import { LucidePlus, LucideTrash, LucideView } from "lucide-react";
import { localjudge } from "@/api/client";
import { ConfirmActionDialog } from "@/components/confirm-action";
import { ContestCard } from "@/components/contest-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/")({
	loader: async ({ abortController }) => {
		const contests = await rejectError(
			localjudge.api.admin.contest.get({
				fetch: {
					signal: abortController.signal,
				},
			}),
		);
		return contests;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const contests = Route.useLoaderData();
	return (
		<>
			<div className="flex items-center justify-between mb-4">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
					Contests
				</h1>
				<Button asChild>
					<Link to="/admin/contest/new">
						<LucidePlus /> Create New
					</Link>
				</Button>
			</div>
			<Separator className="my-6" />
			<div className="grid gap-3">
				{contests.map((contest) => (
					<ContestCard key={contest.id} {...contest}>
						<div className="flex gap-2 w-full">
							<ConfirmActionDialog>
								<Button variant="destructive">
									Delete <LucideTrash />
								</Button>
							</ConfirmActionDialog>
							<Button asChild className="flex-1">
								<Link to="/admin/contest/$id" params={{ id: contest.id }}>
									View Details
									<LucideView />
								</Link>
							</Button>
						</div>
					</ContestCard>
				))}
			</div>
		</>
	);
}
