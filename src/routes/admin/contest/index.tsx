import { createFileRoute, Link } from "@tanstack/react-router";
import { LucidePlus } from "lucide-react";
import { localjudge } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/")({
	loader: async ({ abortController }) => {
		const contests = await rejectError(
			localjudge.api.admin.contest.get({
				fetch: {
					signal: abortController.signal,
				},
			}),
		);
		return contests;
	},
	component: RouteComponent,
});

function ContestCard(props: { id: string; name: string }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{props.name}</CardTitle>
				<CardDescription>{props.id}</CardDescription>
				<CardAction>
					<Button variant="link">Inspect</Button>
				</CardAction>
			</CardHeader>
		</Card>
	);
}

function RouteComponent() {
	const contests = Route.useLoaderData();
	return (
		<>
			<div className="flex items-center justify-between mb-4">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
					Contests
				</h1>
				<Button asChild>
					<Link to="/admin/contest/new">
						<LucidePlus /> Create New
					</Link>
				</Button>
			</div>
			<Separator className="my-6" />
			<div className="grid gap-3">
				{contests.map((contest) => (
					<ContestCard key={contest.id} {...contest} />
				))}
			</div>
		</>
	);
}
