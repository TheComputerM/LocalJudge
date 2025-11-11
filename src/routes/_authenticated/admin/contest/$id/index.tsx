import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
	LucideCheck,
	LucideCopy,
	LucideEye,
	LucideFileBadge,
	LucideFolderArchive,
	LucideTrash,
	LucideTrophy,
} from "lucide-react";
import { localjudge } from "@/api/client";
import { ConfirmActionDialog } from "@/components/confirm-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemSeparator,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { toastManager } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/contest/$id/")({
	loader: async ({ params }) => {
		const overview = await rejectError(
			localjudge.admin.contest({ id: params.id }).overview.get(),
		);
		return overview;
	},
	component: RouteComponent,
});

function DeleteContest() {
	const id = Route.useParams({ select: ({ id }) => id });
	const navigate = Route.useNavigate();
	return (
		<Item>
			<ItemContent>
				<ItemTitle>Delete Contest</ItemTitle>
				<ItemDescription>
					Delete this contest and all its associated data permanently.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<ConfirmActionDialog
					onConfirm={async () => {
						await rejectError(localjudge.contest({ id }).delete());
						toastManager.add({
							title: "Contest deleted",
							type: "success",
						});
						navigate({ to: "/admin/contest" });
					}}
					trigger={
						<Button variant="destructive">
							Delete <LucideTrash />
						</Button>
					}
				/>
			</ItemActions>
		</Item>
	);
}

function DownloadSubmissions() {
	return (
		<Item>
			<ItemContent>
				<ItemTitle>Download Submissions</ItemTitle>
				<ItemDescription>
					Download a zip containing all the submissions made by the participants
					of this contest.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button>
					Download <LucideFolderArchive />
				</Button>
			</ItemActions>
		</Item>
	);
}

function DownloadResults() {
	const id = Route.useParams({ select: ({ id }) => id });
	return (
		<Item>
			<ItemContent>
				<ItemTitle>Download Results</ItemTitle>
				<ItemDescription>
					Download a JSON file containing the results of all the submissions
					made by the participants of this contest.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button
					render={<a href={`/api/admin/contest/${id}/results`} download />}
				>
					Download <LucideFileBadge />
				</Button>
			</ItemActions>
		</Item>
	);
}

function InspectContest() {
	const id = Route.useParams({ select: ({ id }) => id });
	return (
		<Item>
			<ItemContent>
				<ItemTitle>Inspect Contest</ItemTitle>
				<ItemDescription>
					View the contest from a participant's perspective to preview the
					interface and experience.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button
					render={<Link to="/contest/$id" params={{ id }} target="_blank" />}
				>
					Inspect
					<LucideEye />
				</Button>
			</ItemActions>
		</Item>
	);
}

function ContestLeaderboard() {
	const id = Route.useParams({ select: ({ id }) => id });
	return (
		<Item>
			<ItemContent>
				<ItemTitle>View Leaderboard</ItemTitle>
				<ItemDescription>
					View the top 20 participants of this contest on the leaderboard, it
					doesn't matter if the leaderboard option was disabled for the
					participants.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button
					render={
						<Link
							to="/contest/$id/leaderboard"
							params={{ id }}
							target="_blank"
						/>
					}
				>
					Leaderboard
					<LucideTrophy />
				</Button>
			</ItemActions>
		</Item>
	);
}

function Overview() {
	const overview = Route.useLoaderData();
	const contest = Route.useRouteContext({ select: (ctx) => ctx.contest });
	return (
		<div className="grid sm:grid-cols-2 md:grid-cols-6 gap-3">
			<Card className="md:col-span-3">
				<CardHeader>
					<CardDescription>Start Time</CardDescription>
					<CardTitle>{contest.startTime.toLocaleString()}</CardTitle>
				</CardHeader>
			</Card>
			<Card className="md:col-span-3">
				<CardHeader>
					<CardDescription>End Time</CardDescription>
					<CardTitle>{contest.endTime.toLocaleString()}</CardTitle>
				</CardHeader>
			</Card>
			{Object.entries(overview).map(([name, value]) => (
				<Card key={name} className="md:col-span-2">
					<CardHeader>
						<CardDescription className="capitalize">{name}</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums">
							{value}
						</CardTitle>
					</CardHeader>
				</Card>
			))}
		</div>
	);
}

function ContestId() {
	const id = Route.useParams({ select: ({ id }) => id });
	const [copy, isCoped] = useCopyToClipboard();
	return (
		<Item>
			<ItemContent>
				<ItemTitle>Copy Contest Code</ItemTitle>
				<ItemDescription>
					This is the contest ID which is same as the code used to register for
					a contest.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button onClick={() => copy(id)}>
					{isCoped ? <LucideCheck /> : <LucideCopy />}
					Copy ID
				</Button>
			</ItemActions>
		</Item>
	);
}

function RouteComponent() {
	return (
		<div>
			<Overview />
			<Separator className="my-6" />
			<ItemGroup>
				{/*TODO: maybe add heading*/}
				<ContestId />
				<ItemSeparator />
				<InspectContest />
				<ItemSeparator />
				<ContestLeaderboard />
			</ItemGroup>
			<Separator className="my-6" />
			<ItemGroup>
				<DownloadSubmissions />
				<ItemSeparator />
				<DownloadResults />
				<ItemSeparator />
				<DeleteContest />
			</ItemGroup>
		</div>
	);
}
