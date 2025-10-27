import { createFileRoute, Link } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { SubmissionStatusPill } from "@/components/submission-status-pill";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/app/contest/$id/submission")({
	loader: async ({ params }) => {
		const submissions = await rejectError(
			localjudge.contest({ id: params.id }).submission.get(),
		);
		return { submissions };
	},
	component: RouteComponent,
});

function Submissions() {
	const submissions = Route.useLoaderData({
		select: ({ submissions }) => submissions,
	});
	return (
		<>
			{submissions.map((submission) => (
				<TableRow key={submission.id}>
					<TableCell>
						<Link
							from={Route.fullPath}
							to="../problem/$problem"
							params={{ problem: submission.problemNumber.toString() }}
						>
							{submission.problemNumber}. {submission.problem.title}
						</Link>
					</TableCell>
					<TableCell>
						<SubmissionStatusPill id={submission.id} />
					</TableCell>
					<TableCell>{submission.language}</TableCell>
					<TableCell>{submission.createdAt.toLocaleString()}</TableCell>
					<TableCell>
						<Button variant="link" asChild>
							<Link
								to="/app/submission/$id"
								params={{ id: submission.id }}
								target="_blank"
							>
								View
							</Link>
						</Button>
					</TableCell>
				</TableRow>
			))}
		</>
	);
}

function RouteComponent() {
	return (
		<div className="container mx-auto p-4">
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Your Submissions
			</h1>
			<Separator className="my-6" />
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Problem</TableHead>
						<TableHead>Stat1us</TableHead>
						<TableHead>Language</TableHead>
						<TableHead>When</TableHead>
						<TableHead aria-label="Link" />
					</TableRow>
				</TableHeader>
				<TableBody>
					<Submissions />
				</TableBody>
			</Table>
		</div>
	);
}
