import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
	LucideChevronDown,
	LucideChevronUp,
	LucideCircleQuestionMark,
	LucideEdit,
	LucideTrash,
} from "lucide-react";
import { toast } from "sonner";
import { localjudge } from "@/api/client";
import { ConfirmActionDialog } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/$id/problem/")({
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
				<ButtonGroup aria-label="Reorder">
					<Button size="icon" variant="ghost" className="size-6">
						<LucideChevronUp />
					</Button>
					<Button size="icon" variant="ghost" className="size-6">
						<LucideChevronDown />
					</Button>
				</ButtonGroup>
			</ItemMedia>
			<ItemContent>
				<ItemTitle>{props.title}</ItemTitle>
			</ItemContent>
			<ItemActions>
				<ButtonGroup>
					<ConfirmActionDialog
						onConfirm={async () => {
							await rejectError(
								localjudge
									.contest({ id: contest })
									.problem({ problem: props.number })
									.delete(),
							);
							toast.success("Problem deleted successfully");
							await router.invalidate();
						}}
					>
						<Button variant="destructive" size="sm" aria-label="Delete Problem">
							<LucideTrash />
						</Button>
					</ConfirmActionDialog>
					<Button asChild size="sm" aria-label="Edit Problem">
						<Link
							from={Route.fullPath}
							to="./$problem"
							params={{ problem: props.number.toString() }}
						>
							<LucideEdit />
						</Link>
					</Button>
				</ButtonGroup>
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
			<Button className="w-full" asChild>
				<Link from={Route.fullPath} to="./new">
					Add New Problem
				</Link>
			</Button>
		</>
	);
}
