import { createFileRoute, Link } from "@tanstack/react-router";
import {
	LucideChevronDown,
	LucideChevronUp,
	LucideCircleQuestionMark,
	LucideEdit,
	LucideEllipsis,
	LucideTrash,
} from "lucide-react";
import { Fragment } from "react";
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
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import {
	Menu,
	MenuItem,
	MenuPopup,
	MenuSeparator,
	MenuTrigger,
} from "@/components/ui/menu";
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
	const contestId = Route.useParams({ select: (p) => p.id });
	const problems = Route.useLoaderData({ select: ({ problems }) => problems });
	return (
		<Fragment>
			{problems.length > 0 ? (
				<ItemGroup className="gap-2">
					{problems.map((problem, i) => (
						<Item key={problem.number} variant="muted">
							<ItemMedia>{problem.number}.</ItemMedia>
							<ItemContent>
								<ItemTitle>{problem.title}</ItemTitle>
							</ItemContent>
							<ItemActions>
								<Menu>
									<MenuTrigger render={<Button size="icon" variant="ghost" />}>
										<LucideEllipsis />
									</MenuTrigger>
									<MenuPopup>
										<MenuItem disabled={i === 0}>
											<LucideChevronUp />
											Move Up
										</MenuItem>
										<MenuItem disabled={i === problems.length - 1}>
											<LucideChevronDown />
											Move Down
										</MenuItem>
										<MenuItem
											render={
												<Link
													from={Route.fullPath}
													to="./$problem"
													params={{ problem: problem.number.toString() }}
												/>
											}
										>
											<LucideEdit />
											Edit
										</MenuItem>
										<MenuSeparator />
										<ConfirmActionDialog
											onConfirm={async () => {
												await rejectError(
													localjudge
														.contest({ id: contestId })
														.problem({ problem: problem.number })
														.delete(),
												);
												toastManager.add({
													title: "Problem deleted",
													type: "success",
												});
											}}
											nativeButton
											trigger={
												<MenuItem variant="destructive" closeOnClick={false}>
													<LucideTrash />
													Delete
												</MenuItem>
											}
										/>
									</MenuPopup>
								</Menu>
							</ItemActions>
						</Item>
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
				Create New Problem
			</Button>
		</Fragment>
	);
}
