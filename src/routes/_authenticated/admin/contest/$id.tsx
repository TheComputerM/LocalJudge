import {
	createFileRoute,
	Link,
	linkOptions,
	Outlet,
} from "@tanstack/react-router";
import {
	LucideCircleQuestionMark,
	LucideNotebook,
	LucideSettings,
} from "lucide-react";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";

export const Route = createFileRoute("/_authenticated/admin/contest/$id")({
	component: RouteComponent,
});

const links = linkOptions([
	{
		from: Route.fullPath,
		to: ".",
		activeOptions: { exact: true },
		label: "Overview",
		icon: LucideNotebook,
	},
	{
		from: Route.fullPath,
		to: "./settings",
		label: "Settings",
		icon: LucideSettings,
	},
	{
		from: Route.fullPath,
		to: "./problem",
		label: "Problems",
		icon: LucideCircleQuestionMark,
	},
]);

function Navbar() {
	return (
		<NavigationMenu className="max-w-full pb-4 border-b">
			<NavigationMenuList className="gap-2">
				{links.map((link) => (
					<NavigationMenuItem key={link.to}>
						<NavigationMenuLink
							className="flex-row items-center gap-2 py-1.5 font-medium"
							render={<Link {...link} activeProps={{ "data-active": true }} />}
						>
							<link.icon />
							<span>{link.label}</span>
						</NavigationMenuLink>
					</NavigationMenuItem>
				))}
			</NavigationMenuList>
		</NavigationMenu>
	);
}

function RouteComponent() {
	return (
		<>
			<Navbar />
			<br />
			<Outlet />
		</>
	);
}
