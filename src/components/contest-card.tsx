import {
	format,
	formatDistance,
	formatDistanceStrict,
	isBefore,
} from "date-fns";
import { ReactNode, useMemo } from "react";
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
import { Badge } from "./ui/badge";

function ContestStatusBadge(props: { startTime: Date; endTime: Date }) {
	const time = useTime();
	const { color, message } = useMemo(() => {
		if (isBefore(time, props.startTime))
			return {
				color: "bg-green-100 text-green-800",
				message:
					"starts " +
					formatDistance(props.startTime, time, {
						addSuffix: true,
					}),
			};

		if (isBefore(time, props.endTime))
			return {
				color: "bg-amber-100 text-amber-800",
				message:
					"ends " +
					formatDistance(props.endTime, time, {
						addSuffix: true,
					}),
			};

		return {
			color: "bg-red-100 text-red-800",
			message:
				"ended " +
				formatDistance(props.endTime, time, {
					addSuffix: true,
				}),
		};
	}, [time, props.startTime, props.endTime]);

	return <Badge className={color}>{message}</Badge>;
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
				<CardDescription>ID: {props.id}</CardDescription>
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
