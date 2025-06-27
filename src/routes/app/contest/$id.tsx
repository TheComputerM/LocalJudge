import {
	createFileRoute,
	Link,
	linkOptions,
	Outlet,
} from "@tanstack/react-router";
import {
	LucideFileCode2,
	LucideGavel,
	LucideInbox,
	LucideMenu,
	LucideTrophy,
} from "lucide-react";
import { localjudge } from "@/api/client";
import { RefreshButton } from "@/components/refresh-button";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/app/contest/$id")({
	beforeLoad: async ({ params, abortController }) => {
		const contest = await rejectError(
			localjudge.api.contest({ id: params.id }).get({
				fetch: { signal: abortController.signal },
			}),
		);

		return { contest };
	},
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
		to: "./submissions",
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

function Navbar() {
	return (
		<header className="flex shrink-0 h-12 items-center justify-between gap-2 border-b px-4">
			<span className="inline-flex items-center gap-2 font-semibold">
				<LucideGavel />
				LocalJudge
				<span className="text-xs text-muted-foreground">by TheComputerM</span>
			</span>
			<Popover>
				<PopoverTrigger asChild>
					<Button className="md:hidden" size="icon" variant="outline">
						<LucideMenu />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-36 p-1 md:hidden">
					<NavigationMenu className="max-w-none *:w-full">
						<NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
							{navigationLinks.map((link) => (
								<NavigationMenuItem key={link.to} className="w-full">
									<NavigationMenuLink
										className="flex-row items-center gap-2 py-1.5"
										asChild
									>
										<Link
											from={link.from}
											to={link.to}
											activeProps={{ "data-active": true }}
										>
											<link.icon
												size={16}
												className="text-muted-foreground/80"
												aria-hidden="true"
											/>
											<span>{link.label}</span>
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
							))}
						</NavigationMenuList>
					</NavigationMenu>
				</PopoverContent>
			</Popover>
			<NavigationMenu className="max-md:hidden">
				<NavigationMenuList className="gap-2">
					{navigationLinks.map((link) => (
						<NavigationMenuItem key={link.to}>
							<NavigationMenuLink
								className="text-foreground hover:text-primary flex-row items-center gap-2 py-1.5 font-medium"
								asChild
							>
								<Link
									from={link.from}
									to={link.to}
									activeProps={{ "data-active": true }}
								>
									<link.icon
										size={16}
										className="text-muted-foreground/80"
										aria-hidden="true"
									/>
									<span>{link.label}</span>
								</Link>
							</NavigationMenuLink>
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>
			<div className="inline-flex items-center gap-2">
				<RefreshButton />
				<ThemeToggle />
				<Separator
					orientation="vertical"
					className="data-[orientation=vertical]:h-4"
				/>
				<span className="text-sm">45m left</span>
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
