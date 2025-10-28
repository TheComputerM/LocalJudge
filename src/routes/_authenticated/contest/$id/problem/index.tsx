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

export const Route = createFileRoute("/_authenticated/contest/$id/problem/")({
	loader: ({ context }) => context.problems,
	component: RouteComponent,
});

function RouteComponent() {
	const problems = Route.useLoaderData();
	return (
		<div className="container mx-auto">
			<br />
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Problems
			</h1>
			<br />
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-16">No.</TableHead>
						<TableHead>Title</TableHead>
						<TableHead>Time Limit</TableHead>
						<TableHead>Memory Limit</TableHead>
						<TableHead aria-label="Link" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{problems.map((problem) => (
						<TableRow key={problem.number}>
							<TableCell>{problem.number}</TableCell>
							<TableCell>{problem.title}</TableCell>
							<TableCell>{problem.timeLimit}ms</TableCell>
							<TableCell>{problem.memoryLimit}KB</TableCell>
							<TableCell>
								<Button variant="link" asChild>
									<Link
										from={Route.fullPath}
										to="./$problem"
										params={{ problem: problem.number.toString() }}
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
