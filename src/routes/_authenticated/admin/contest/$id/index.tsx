import { createFileRoute, Link } from "@tanstack/react-router";
import {
	LucideEye,
	LucideFileBadge,
	LucideFolderArchive,
	LucideTrash,
} from "lucide-react";
import { toast } from "sonner";
import { localjudge } from "@/api/client";
import { ConfirmActionDialog } from "@/components/confirm-action";
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
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/contest/$id/")({
	loader: async ({ params }) => {
		const overview = await rejectError(
			localjudge.contest({ id: params.id }).overview.get(),
		);
		return { overview };
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
						toast.success("Contest deleted successfully");
						navigate({ to: "/admin/contest" });
					}}
				>
					<Button variant="destructive">
						Delete <LucideTrash />
					</Button>
				</ConfirmActionDialog>
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
	return (
		<Item>
			<ItemContent>
				<ItemTitle>Download Results</ItemTitle>
				<ItemDescription>
					Download a csv file containing the results of all the submissions made
					by the participants of this contest.
				</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button>
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
				<Button asChild>
					<Link to="/contest/$id" params={{ id }} target="_blank">
						Inspect
						<LucideEye />
					</Link>
				</Button>
			</ItemActions>
		</Item>
	);
}

function RouteComponent() {
	const overview = Route.useLoaderData({ select: ({ overview }) => overview });
	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="px-6">
						<CardDescription>Participants</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums">
							{overview.registrations}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="px-6">
						<CardDescription>Submitters</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums">
							{overview.submitters}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="px-6">
						<CardDescription>Submissions</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums">
							{overview.submissions}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>
			<Separator className="my-6" />
			<ItemGroup>
				<InspectContest />
				<ItemSeparator />
				<DownloadSubmissions />
				<ItemSeparator />
				<DownloadResults />
				<ItemSeparator />
				<DeleteContest />
			</ItemGroup>
		</div>
	);
}
