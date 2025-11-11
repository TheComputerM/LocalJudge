import {
	format,
	formatDistance,
	formatDistanceStrict,
	isBefore,
} from "date-fns";
import { type ReactNode, useMemo } from "react";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTime } from "@/hooks/use-time";
import { Pill, PillIndicator, type PillIndicatorProps } from "./kibo-ui/pill";
import { CopyBadge } from "./ui/copy-badge";

function ContestStatusBadge(props: { startTime: Date; endTime: Date }) {
	const time = useTime();
	const {
		status,
		message,
	}: { status: PillIndicatorProps["variant"]; message: string } =
		useMemo(() => {
			if (isBefore(time, props.startTime))
				return {
					status: "success",
					message:
						"starts " +
						formatDistance(props.startTime, time, {
							addSuffix: true,
						}),
				};

			if (isBefore(time, props.endTime))
				return {
					status: "info",
					message:
						"ends " +
						formatDistance(props.endTime, time, {
							addSuffix: true,
						}),
				};

			return {
				status: "error",
				message:
					"ended " +
					formatDistance(props.endTime, time, {
						addSuffix: true,
					}),
			};
		}, [time, props.startTime, props.endTime]);

	return (
		<Pill>
			<PillIndicator pulse={status === "info"} variant={status} />
			{message}
		</Pill>
	);
}

export function ContestCard(props: {
	id: string;
	startTime: Date;
	endTime: Date;
	name: string;
	children: ReactNode;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{props.name}</CardTitle>
				<CardDescription className="inline-flex items-center gap-2">
					ID: <CopyBadge variant="outline">{props.id}</CopyBadge>
				</CardDescription>
				<CardAction>
					<ContestStatusBadge
						startTime={props.startTime}
						endTime={props.endTime}
					/>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3">
					<div>
						<p className="text-muted-foreground text-sm">Start:</p>
						<p className="font-medium">
							{format(props.startTime, "hh:mm:ss a, do LLL yyyy")}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-sm">End:</p>
						<p className="font-medium">
							{format(props.endTime, "hh:mm:ss a, do LLL yyyy")}
						</p>
					</div>
					<div>
						<p className="text-muted-foreground text-sm">Duration:</p>
						<p className="font-medium">
							{formatDistanceStrict(props.startTime, props.endTime)}
						</p>
					</div>
				</div>
			</CardContent>
			<CardFooter>{props.children}</CardFooter>
		</Card>
	);
}
