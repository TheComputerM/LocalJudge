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
	LucideTableProperties,
	LucideUsers,
} from "lucide-react";
import { RefreshButton } from "@/components/refresh-button";
import { SignOutButton } from "@/components/sign-out";
import { ThemeToggle } from "@/components/theme-provider";
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

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ location, context: { auth } }) => {
		if (!auth || auth.user.role !== "admin") {
			throw redirect({
				to: "/login",
				search: { redirect: location.pathname },
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
	{ to: "/admin/participant", label: "Participants", icon: LucideUsers },
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
									<SidebarMenuButton asChild>
										<Link {...link} activeProps={{ "data-active": true }}>
											<link.icon />
											{link.label}
										</Link>
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
			<Separator
				orientation="vertical"
				className="mr-2 data-[orientation=vertical]:h-4"
			/>
			{/* TODO: add breadcrumbs when implemented */}
			<div className="grow-1" />
			<RefreshButton />
			<ThemeToggle />
			<Separator
				orientation="vertical"
				className="mr-2 data-[orientation=vertical]:h-4"
			/>
			<SignOutButton />
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
