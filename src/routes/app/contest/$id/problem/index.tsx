import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/app/contest/$id/problem/")({
	loader: ({ context }) => context.problems,
	component: RouteComponent,
});

function RouteComponent() {
	const problems = Route.useLoaderData();
	return (
		<div className="container mx-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-24">No.</TableHead>
						<TableHead>Problem</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{problems.map((problem) => (
						<TableRow key={problem.id}>
							<TableCell>{problem.number}</TableCell>
							<TableCell>{problem.title}</TableCell>
							<TableCell>
								<Button variant="link" asChild>
									<Link
										from={Route.fullPath}
										to="./$number"
										params={{ number: problem.number.toString() }}
									>
										View
									</Link>
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
