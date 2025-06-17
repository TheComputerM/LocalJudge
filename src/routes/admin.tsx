import {
	createFileRoute,
	Link,
	linkOptions,
	Outlet,
} from "@tanstack/react-router";
import {
	LucideBookText,
	LucideCog,
	LucideLayoutDashboard,
	LucideTableProperties,
	LucideUsers,
} from "lucide-react";
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
	{ to: "/admin/configuration", label: "Configuration", icon: LucideCog },
]);

function AppSidebar() {
	return (
		<Sidebar>
			<SidebarHeader>
				<div className="text-center rounded py-2 font-semibold bg-muted">
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
										<Link {...link} activeProps={{ className: "bg-accent" }}>
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

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					{/* TODO: add breadcrumbs when implemented */}
					{/* <Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem className="hidden md:block">
								<BreadcrumbLink href="#">
									Building Your Application
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
							<BreadcrumbItem>
								<BreadcrumbPage>Data Fetching</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb> */}
				</header>
				<div className="container mx-auto p-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
