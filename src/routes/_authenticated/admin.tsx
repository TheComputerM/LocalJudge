import {
	createFileRoute,
	Link,
	linkOptions,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import {
	LucideBookText,
	LucideCog,
	LucideLayoutDashboard,
	LucidePackage,
	LucideSearchCode,
	LucideTableProperties,
	LucideUsers,
} from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { ThemeToggle } from "@/components/providers/theme";
import { RefreshButton } from "@/components/refresh-button";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated/admin")({
	beforeLoad: async ({ context: { auth } }) => {
		if (!auth.user.role?.includes("admin")) {
			throw redirect({
				to: "/app",
			});
		}
	},
	component: RouteComponent,
});

const navLinks = linkOptions([
	{
		to: "/admin",
		label: "Dashboard",
		icon: LucideLayoutDashboard,
		activeOptions: { exact: true },
	},
	{ to: "/admin/contest", label: "Contests", icon: LucideTableProperties },
	{ to: "/admin/user", label: "Users", icon: LucideUsers },
	{ to: "/admin/submissions", label: "Submissions", icon: LucideSearchCode },
	{ to: "/admin/languages", label: "Languages", icon: LucidePackage },
	{ to: "/admin/configuration", label: "Configuration", icon: LucideCog },
]);

function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<div className="text-center rounded py-2 font-semibold bg-muted/50">
					LocalJudge Admin
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navLinks.map((link) => (
								<SidebarMenuItem key={link.to}>
									<SidebarMenuButton
										render={
											<Link {...link} activeProps={{ "data-active": true }} />
										}
									>
										<link.icon />
										{link.label}
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton>
							<LucideBookText />
							Wiki
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

function Navbar() {
	return (
		<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
			<SidebarTrigger className="-ml-1" />
			<Separator orientation="vertical" />
			{/* TODO: add breadcrumbs when implemented */}
			<div className="grow" />
			<RefreshButton />
			<ThemeToggle />
			<Separator orientation="vertical" className="mr-2" />
			<UserProfile />
		</header>
	);
}

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Navbar />
				<div className="container mx-auto p-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
