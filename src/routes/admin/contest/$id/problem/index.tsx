import { createFileRoute, Link } from "@tanstack/react-router";
import {
	LucideChevronDown,
	LucideChevronUp,
	LucideEdit,
	LucideTrash,
} from "lucide-react";
import { localjudge } from "@/api/client";
import { ConfirmActionDialog } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
		return problems;
	},
	component: RouteComponent,
});

function ProblemCard(props: { number: number; title: string }) {
	return (
		<Item key={props.number} variant="muted">
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
					<ConfirmActionDialog>
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

function RouteComponent() {
	const problems = Route.useLoaderData();
	return (
		<>
			{problems.length > 0 ? (
				<ItemGroup className="gap-3">{problems.map(ProblemCard)}</ItemGroup>
			) : (
				"No Problems Created"
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
