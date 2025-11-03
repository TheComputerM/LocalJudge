import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
	LucideChevronDown,
	LucideChevronUp,
	LucideCircleQuestionMark,
	LucideEdit,
	LucideTrash,
} from "lucide-react";
import { localjudge } from "@/api/client";
import { ConfirmActionDialog } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Group, GroupItem } from "@/components/ui/group";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { toastManager } from "@/components/ui/toast";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute(
	"/_authenticated/admin/contest/$id/problem/",
)({
	loader: async ({ params }) => {
		const problems = await rejectError(
			localjudge.contest({ id: params.id }).problem.get(),
		);
		return { problems };
	},
	component: RouteComponent,
});

function ProblemCard(props: { number: number; title: string }) {
	const router = useRouter();
	const contest = Route.useParams({ select: ({ id }) => id });
	return (
		<Item variant="muted">
			<ItemMedia>
				<Group aria-label="Reorder">
					<GroupItem
						render={<Button size="icon" variant="ghost" className="size-6" />}
					>
						<LucideChevronUp />
					</GroupItem>
					<GroupItem
						render={<Button size="icon" variant="ghost" className="size-6" />}
					>
						<LucideChevronDown />
					</GroupItem>
				</Group>
			</ItemMedia>
			<ItemContent>
				<ItemTitle>{props.title}</ItemTitle>
			</ItemContent>
			<ItemActions>
				<Group>
					<GroupItem
						render={<Button size="icon-sm" aria-label="Delete Problem" />}
					>
						<LucideTrash />
					</GroupItem>
					<GroupItem
						render={
							<Button
								render={
									<Link
										from={Route.fullPath}
										to="./$problem"
										params={{ problem: props.number.toString() }}
									/>
								}
								size="sm"
								aria-label="Edit Problem"
							/>
						}
					>
						<LucideEdit />
					</GroupItem>
				</Group>
			</ItemActions>
		</Item>
	);
}

function EmptyProblems() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<LucideCircleQuestionMark />
				</EmptyMedia>
				<EmptyTitle>No Problems Created</EmptyTitle>
				<EmptyDescription>
					Create a new problem to get started.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

function RouteComponent() {
	const problems = Route.useLoaderData({ select: ({ problems }) => problems });
	return (
		<>
			{problems.length > 0 ? (
				<ItemGroup className="gap-3">
					{problems.map((problem) => (
						<ProblemCard key={problem.number} {...problem} />
					))}
				</ItemGroup>
			) : (
				<EmptyProblems />
			)}
			<Separator className="my-6" />
			<Button
				className="w-full"
				render={<Link from={Route.fullPath} to="./new" />}
			>
				Add New Problem
			</Button>
		</>
	);
}
