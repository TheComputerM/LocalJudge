import { createFileRoute } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/admin/contest/$id/")({
	loader: async ({ params }) => {
		const overview = await rejectError(
			localjudge.contest({ id: params.id }).overview.get(),
		);
		return { overview };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const overview = Route.useLoaderData({ select: ({ overview }) => overview });
	return (
		<div className="flex gap-3">
			<Card className="grow">
				<CardHeader className="px-6">
					<CardDescription>Participants</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums">
						{overview.registrations}
					</CardTitle>
				</CardHeader>
			</Card>
			<Card className="grow">
				<CardHeader className="px-6">
					<CardDescription>Submissions</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums">
						{overview.submissions}
					</CardTitle>
				</CardHeader>
			</Card>
		</div>
	);
}
