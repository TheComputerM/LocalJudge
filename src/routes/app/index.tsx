import { createFileRoute, Link } from "@tanstack/react-router";
import {
	format,
	formatDistance,
	formatDuration,
	intervalToDuration,
	isPast,
	lightFormat,
} from "date-fns";
import { LucideGavel } from "lucide-react";
import { useMemo } from "react";
import { localjudge } from "@/api/client";
import { SignOutButton } from "@/components/sign-out";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTime } from "@/hooks/use-time";

export const Route = createFileRoute("/app/")({
	loader: async () => {
		const { data: contests, error } = await localjudge.api.contest.get();
		if (error) throw error;

		return { contests };
	},
	component: RouteComponent,
});

function NavClock() {
	const currentTime = useTime();
	return <span>{lightFormat(currentTime, "HH:mm:ss")}</span>;
}

function Navbar() {
	return (
		<header className="border-b px-4 md:px-6">
			<div className="flex h-16 items-center justify-between gap-4">
				<div className="flex-1 inline-flex items-center gap-2 text-primary">
					<LucideGavel />
					<span className="font-semibold text-lg max-sm:hidden">
						LocalJudge
					</span>
				</div>
				<div className="grow text-center">
					<NavClock />
				</div>
				<div className="flex flex-1 items-center justify-end gap-2">
					<ThemeToggle />
					<SignOutButton />
				</div>
			</div>
		</header>
	);
}

function RegisterForm() {
	return (
		<div className="flex gap-2">
			<Input placeholder="Contest Code" />
			<Button>Register</Button>
		</div>
	);
}

function ContestCard(props: {
	id: string;
	name: string;
	startTime: Date;
	endTime: Date;
}) {
	const currentTime = useTime();
	const isContestOver = useMemo(() => isPast(props.endTime), [props.endTime]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{props.name}</CardTitle>
				<CardDescription>
					{formatDuration(
						intervalToDuration({ start: props.startTime, end: props.endTime }),
					)}
				</CardDescription>
				<CardAction>
					<Button asChild>
						<Link to="/app/contest/$contestId" params={{ contestId: props.id }}>
							Enter
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<CardFooter className="flex justify-between text-sm">
				<span>
					{format(props.startTime, "do MMM, HH:mm")} —{" "}
					{format(props.endTime, "do MMM, HH:mm")}
				</span>
				<span>
					{isContestOver ? "ended " : "started "}
					{formatDistance(
						isContestOver ? props.endTime : props.startTime,
						currentTime,
						{ addSuffix: true },
					)}
				</span>
			</CardFooter>
		</Card>
	);
}

function ContestList() {
	const contests = Route.useLoaderData({ select: (data) => data.contests });

	return (
		<div className="grid gap-4">
			{contests.map((contest) => (
				<ContestCard key={contest.id} {...contest} />
			))}
		</div>
	);
}

function RouteComponent() {
	return (
		<>
			<Navbar />
			<div className="container mx-auto p-4">
				<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
					Contests
				</h1>
				<p className="leading-7 [&:not(:first-child)]:my-6">
					List of contests you are registered for, ask your admistrator for the
					contest code if it doesn't appear here.
				</p>
				<RegisterForm />
			</div>
			<Separator className="my-8" />
			<div className="container mx-auto p-4">
				<ContestList />
			</div>
		</>
	);
}
