import { createFileRoute, Link } from "@tanstack/react-router";
import { LucideChevronDown, LucideChevronUp, LucidePencil } from "lucide-react";
import { localjudge } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/$id/problem/")({
	loader: async ({ params }) => {
		const problems = await rejectError(
			localjudge.api.admin.contest({ id: params.id }).problem.get(),
		);
		return problems;
	},
	component: RouteComponent,
});

function ProblemCard(props: { number: number; title: string }) {
	return (
		<div
			className="bg-card border flex justify-between items-center rounded-md p-2"
			key={props.number}
		>
			<div className="font-semibold inline-flex items-center gap-2">
				<div className="flex flex-col">
					<Button size="icon" variant="ghost" className="size-6">
						<LucideChevronUp />
					</Button>
					<Button size="icon" variant="ghost" className="size-6">
						<LucideChevronDown />
					</Button>
				</div>
				{props.title}
			</div>
			<Button asChild>
				<Link
					from={Route.fullPath}
					to="./$problem"
					params={{ problem: props.number.toString() }}
				>
					Edit
					<LucidePencil />
				</Link>
			</Button>
		</div>
	);
}

function RouteComponent() {
	const problems = Route.useLoaderData();
	return (
		<div className="grid gap-3">
			{problems.length > 0 ? problems.map(ProblemCard) : "No Problems Created"}
			<Separator className="my-6" />
			<Button>
				<Link from={Route.fullPath} to="./new">
					Add New Problem
				</Link>
			</Button>
		</div>
	);
}
