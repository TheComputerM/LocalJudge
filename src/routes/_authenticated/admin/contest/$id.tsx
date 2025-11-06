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
	LucideUsers,
} from "lucide-react";
import { localjudge } from "@/api/client";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/contest/$id")({
	beforeLoad: async ({ params }) => {
		const contest = await rejectError(
			localjudge.contest({ id: params.id }).get(),
		);
		return { contest };
	},
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
		to: "./settings",
		label: "Participants",
		icon: LucideUsers,
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
		<NavigationMenu className="max-w-full p-2 mb-3 bg-sidebar rounded-md">
			<NavigationMenuList className="gap-2 justify-start">
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
			<Outlet />
		</>
	);
}
