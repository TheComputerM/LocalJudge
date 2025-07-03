import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LucideFileQuestion, LucideSettings } from "lucide-react";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";

export const Route = createFileRoute("/admin/contest/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<NavigationMenu className="mx-auto">
				<NavigationMenuList className="rounded-md border p-1 gap-1">
					<NavigationMenuItem>
						<NavigationMenuLink asChild className="flex-row items-center">
							<Link
								from={Route.fullPath}
								to="."
								activeProps={{ "data-active": true }}
								activeOptions={{ exact: true }}
							>
								<LucideSettings />
								Settings
							</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuLink asChild className="flex-row items-center">
							<Link
								from={Route.fullPath}
								to="./problem"
								activeProps={{ "data-active": true }}
							>
								<LucideFileQuestion />
								Problems
							</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
			<Outlet />
		</>
	);
}
