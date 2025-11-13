import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
	LucideNotebookPen,
	LucidePlus,
	LucideTrash,
	LucideView,
} from "lucide-react";
import { localjudge } from "@/api/client";
import { ConfirmActionDialog } from "@/components/confirm-action";
import { ContestCard } from "@/components/contest-card";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { toastManager } from "@/components/ui/toast";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/contest/")({
	loader: async () => {
		const contests = await rejectError(localjudge.admin.contest.get());
		return contests;
	},
	component: RouteComponent,
});

const CreateContestButton = () => (
	<Button render={<Link to="/admin/contest/new" />}>
		<LucidePlus /> Create New
	</Button>
);

const EmptyContests = () => (
	<Empty>
		<EmptyHeader>
			<EmptyMedia variant="icon">
				<LucideNotebookPen />
			</EmptyMedia>
			<EmptyTitle>No Contests Found</EmptyTitle>
			<EmptyDescription>Create a new contest on LocalJudge</EmptyDescription>
		</EmptyHeader>
		<EmptyContent>
			<CreateContestButton />
		</EmptyContent>
	</Empty>
);

function RouteComponent() {
	const contests = Route.useLoaderData();
	const router = useRouter();
	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
					Contests
				</h1>
				<CreateContestButton />
			</div>
			<Separator className="my-6" />
			{contests.length > 0 ? (
				<div className="grid gap-3">
					{contests.map((contest) => (
						<ContestCard key={contest.id} {...contest}>
							<div className="flex gap-2 w-full">
								<ConfirmActionDialog
									onConfirm={async () => {
										await rejectError(
											localjudge.contest({ id: contest.id }).delete(),
										);
										toastManager.add({
											title: "Contest deleted",
											type: "success",
										});
										await router.invalidate({
											filter: (r) => r.id === Route.id,
										});
									}}
									trigger={
										<Button variant="destructive">
											Delete <LucideTrash />
										</Button>
									}
								/>
								<Button
									render={
										<Link to="/admin/contest/$id" params={{ id: contest.id }} />
									}
									className="flex-1"
								>
									View Details
									<LucideView />
								</Button>
							</div>
						</ContestCard>
					))}
				</div>
			) : (
				<EmptyContests />
			)}
		</>
	);
}
