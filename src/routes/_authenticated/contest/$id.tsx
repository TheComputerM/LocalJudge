import {
	createFileRoute,
	Link,
	linkOptions,
	Outlet,
	useHydrated,
} from "@tanstack/react-router";
import { differenceInSeconds } from "date-fns";
import {
	LucideFileCode2,
	LucideGavel,
	LucideInbox,
	LucideMenu,
	LucideTrophy,
} from "lucide-react";
import { useMemo } from "react";
import { localjudge } from "@/api/client";
import { ThemeToggle } from "@/components/providers/theme";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useTime } from "@/hooks/use-time";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/contest/$id")({
	beforeLoad: async ({ params }) => {
		const contest = await rejectError(
			localjudge.contest({ id: params.id }).get(),
		);

		return { contest };
	},
	loader: ({ context }) => context.contest,
	component: RouteComponent,
});

const navigationLinks = linkOptions([
	{
		from: Route.fullPath,
		to: "./problem",
		label: "Editor",
		icon: LucideFileCode2,
	},
	{
		from: Route.fullPath,
		to: "./submission",
		label: "Submissons",
		icon: LucideInbox,
	},
	{
		from: Route.fullPath,
		to: "./leaderboard",
		label: "Leaderboard",
		icon: LucideTrophy,
	},
]);

function RemainingTime() {
	const endTime = Route.useLoaderData({ select: (data) => data.endTime });
	const time = useTime();
	const hydrated = useHydrated();
	const timeLeft = useMemo(() => {
		if (!hydrated) return "--h:--m:--s";
		let seconds = differenceInSeconds(endTime, time);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(seconds / 3600);
		minutes %= 60;
		seconds %= 60;
		return `${hours}h:${minutes}m:${seconds}s`;
	}, [endTime, time, hydrated]);
	return <span className="text-sm min-w-28 text-center">{timeLeft}</span>;
}

function NavigationItems() {
	return navigationLinks.map((link) => (
		<NavigationMenuItem key={link.to}>
			<NavigationMenuLink
				className="flex-row items-center gap-2 py-1.5 font-medium"
				render={
					<Link
						from={link.from}
						to={link.to}
						activeProps={{ "data-active": true }}
					/>
				}
			>
				<link.icon
					size={16}
					className="text-foreground/80"
					aria-hidden="true"
				/>
				<span>{link.label}</span>
			</NavigationMenuLink>
		</NavigationMenuItem>
	));
}

function Navbar() {
	return (
		<header className="flex shrink-0 h-12 items-center justify-between gap-2 border-b px-4">
			<span className="inline-flex items-center gap-2 font-semibold">
				<LucideGavel />
				LocalJudge
				<span className="text-xs text-muted-foreground">by TheComputerM</span>
			</span>
			<Popover>
				<PopoverTrigger
					render={
						<Button className="md:hidden" size="icon" variant="outline" />
					}
				>
					<LucideMenu />
				</PopoverTrigger>
				<PopoverContent className="w-36 p-1 md:hidden">
					<NavigationMenu className="max-w-none *:w-full">
						<NavigationMenuList className="flex-col items-start gap-1 *:w-full">
							<NavigationItems />
						</NavigationMenuList>
					</NavigationMenu>
				</PopoverContent>
			</Popover>
			<NavigationMenu className="max-md:hidden">
				<NavigationMenuList className="gap-2">
					<NavigationItems />
				</NavigationMenuList>
			</NavigationMenu>
			<div className="inline-flex items-center gap-2">
				<RefreshButton />
				<ThemeToggle />
				<Separator orientation="vertical" />
				<RemainingTime />
			</div>
		</header>
	);
}

function RouteComponent() {
	return (
		<>
			<Navbar />
			<Outlet />
		</>
	);
}
