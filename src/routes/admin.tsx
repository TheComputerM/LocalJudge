import {
	createFileRoute,
	Link,
	linkOptions,
	Outlet,
	redirect,
	useRouter,
} from "@tanstack/react-router";
import {
	LucideBookText,
	LucideCog,
	LucideLayoutDashboard,
	LucideLogOut,
	LucideTableProperties,
	LucideUsers,
} from "lucide-react";
import { appClient } from "@/api/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
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
import { authClient } from "@/lib/auth/client";

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ location }) => {
		const { data } = await appClient.api.user.get();
		if (!data || data.user.role !== "admin") {
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

function SignOutButton() {
	const router = useRouter();
	async function signOut() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.invalidate();
				},
			},
		});
	}
	return (
		<Button variant="secondary" onClick={signOut}>
			Sign Out
			<LucideLogOut />
		</Button>
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
					<div className="grow-1" />
					<ThemeToggle />
					<Separator
						orientation="vertical"
						className="mr-2 data-[orientation=vertical]:h-4"
					/>
					<SignOutButton />
				</header>
				<div className="container mx-auto p-4">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
