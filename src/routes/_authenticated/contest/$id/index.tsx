import { createFileRoute, Navigate, useHydrated } from "@tanstack/react-router";
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
	const contest = Route.useLoaderData();
	const time = useTime();
	const hydrated = useHydrated();
	const message = useMemo(() => {
		if (!hydrated) return "-- -- --";
		const duration = intervalToDuration({
			start: time,
			end: contest.startTime,
		});
		return formatDuration(duration);
	}, [time, contest, hydrated]);

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

function RouteComponent() {
	const contest = Route.useLoaderData();
	const time = useTime();
	return (
		<div className="container mx-auto flex items-center justify-center h-[calc(100svh-6rem)]">
			{isBefore(time, contest.startTime) ? (
				<BeforeStart />
			) : isAfter(time, contest.endTime) ? (
				<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
					Contest has Ended
				</h3>
			) : (
				<Navigate from={Route.fullPath} to="./problem" />
			)}
		</div>
	);
}
