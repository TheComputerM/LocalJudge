import { createFileRoute, Navigate } from "@tanstack/react-router";
import {
	formatDuration,
	intervalToDuration,
	isAfter,
	isBefore,
} from "date-fns";
import { useMemo } from "react";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { useTime } from "@/hooks/use-time";

export const Route = createFileRoute("/_authenticated/contest/$id/")({
	beforeLoad: ({ params, context }) => {
		// throw redirect({ to: "/contest/$id/problem", params });
	},
	loader: ({ context }) => context.contest,
	component: RouteComponent,
});

function BeforeStart() {
	const time = useTime();
	const message = useMemo(() => {
		const duration = intervalToDuration({
			start: time,
			end: new Date(2030, 6, 2),
		});
		return formatDuration(duration, {
			format: ["hours", "minutes", "seconds"],
		});
	}, [time]);

	return (
		<Empty>
			<EmptyHeader>
				<EmptyDescription>Contest starts in...</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<EmptyTitle>{message}</EmptyTitle>
			</EmptyContent>
		</Empty>
	);
}

function AfterEnd() {
	return (
		<Empty>
			<EmptyHeader>Contest has ended</EmptyHeader>
		</Empty>
	);
}

function RouteComponent() {
	const contest = Route.useLoaderData();
	const time = useTime();
	return (
		<div className="container mx-auto py-16 flex items-center justify-center">
			{isBefore(time, contest.startTime) ? (
				<BeforeStart />
			) : isAfter(time, contest.endTime) ? (
				<AfterEnd />
			) : (
				<Navigate from={Route.fullPath} to="./problem" />
			)}
		</div>
	);
}
