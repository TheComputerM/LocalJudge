import { createFileRoute, Link } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import { StatsGrid } from "@/components/stats-grid";
import { SubmissionStatusBadge } from "@/components/submission-status-badge";
import { Button } from "@/components/ui/button";
import {
	Frame,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@/components/ui/frame";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { rejectError } from "@/lib/utils";

// TODO: refresh route data after 1s repeatedly
export const Route = createFileRoute("/_authenticated/admin/")({
	loader: async ({ abortController }) => {
		const [overview, submissions] = await Promise.all([
			rejectError(
				localjudge.admin.overview.get({
					fetch: {
						signal: abortController.signal,
					},
				}),
			),
			rejectError(
				localjudge.admin.submission.get({
					query: {
						page: 1,
						pageSize: 20,
					},
				}),
			),
		]);
		return { overview, submissions };
	},
	component: RouteComponent,
});

function RecentSubmissions() {
	const data = Route.useLoaderData({
		select: ({ submissions }) => submissions,
	});

	return (
		<Frame>
			<FrameHeader>
				<FrameTitle>Recent Submissions</FrameTitle>
			</FrameHeader>
			<FramePanel>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>User</TableHead>
							<TableHead>Contest</TableHead>
							<TableHead>Problem</TableHead>
							<TableHead>Language</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Time</TableHead>
							<TableHead />
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((submission) => (
							<TableRow key={submission.id}>
								<TableCell>
									<Link
										to="/admin/participant/$user"
										params={{ user: submission.userId }}
									>
										{submission.user.name}
									</Link>
								</TableCell>
								<TableCell>
									<Link
										to="/admin/contest/$id"
										params={{ id: submission.contestId }}
									>
										{submission.contest.name}
									</Link>
								</TableCell>
								<TableCell>
									<Link
										to="/admin/contest/$id/problem/$problem"
										params={{
											id: submission.contestId,
											problem: submission.problemNumber.toString(),
										}}
									>
										{submission.problem.title}
									</Link>
								</TableCell>
								<TableCell>{submission.language}</TableCell>
								<TableCell>
									<SubmissionStatusBadge id={submission.id} />
								</TableCell>
								<TableCell>{submission.createdAt.toLocaleString()}</TableCell>
								<TableCell>
									<Button
										variant="link"
										render={
											<Link
												to="/app/submission/$id"
												params={{ id: submission.id }}
											/>
										}
									>
										View
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</FramePanel>
		</Frame>
	);
}

function RouteComponent() {
	const overview = Route.useLoaderData({ select: ({ overview }) => overview });

	return (
		<div>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Admin Dashboard
			</h1>
			<br />
			<StatsGrid
				data={Object.entries(overview.statistics).map(([name, value]) => ({
					name: name.charAt(0).toUpperCase() + name.slice(1),
					value: value.toString(),
				}))}
			/>
			<br />
			<RecentSubmissions />
		</div>
	);
}
