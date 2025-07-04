import { createFileRoute, Link } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
		<Card key={props.number}>
			<CardContent className="flex justify-between items-center">
				<CardTitle>{props.title}</CardTitle>
				<Button asChild>
					<Link
						from={Route.fullPath}
						to="./$problem"
						params={{ problem: props.number.toString() }}
					>
						Edit
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}

function RouteComponent() {
	const problems = Route.useLoaderData();
	return (
		<div className="grid gap-3">
			{problems.length > 0 ? problems.map(ProblemCard) : "No Problems Created"}
			<Separator className="my-6" />
			<Button>
				<Link
					from={Route.fullPath}
					to="./$problem"
					params={{ problem: (problems.length + 1).toString() }}
				>
					Add New Problem
				</Link>
			</Button>
		</div>
	);
}
