import { createFileRoute, Link } from "@tanstack/react-router";
import {
	LucideEye,
	LucideFileBadge,
	LucideFolderArchive,
	LucideTrash,
} from "lucide-react";
import { localjudge } from "@/api/client";
import { ConfirmActionDialog } from "@/components/confirm-action";
import { StatsGrid } from "@/components/stats-grid";
import { Button } from "@/components/ui/button";
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

function RouteComponent() {
	const overview = Route.useLoaderData({ select: ({ overview }) => overview });
	return (
		<div>
			<StatsGrid
				data={Object.entries(overview).map(([name, value]) => ({
					name: name.charAt(0).toUpperCase() + name.slice(1),
					value: value.toString(),
				}))}
			/>
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
