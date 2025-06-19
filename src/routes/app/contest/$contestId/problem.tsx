import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/app/contest/$contestId/problem")({
	component: RouteComponent,
});

function AppSidebar() {
	const problemItems = [1, 2, 3];
	return (
		<Sidebar variant="floating">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Problems</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{problemItems.map((p) => (
								<SidebarMenuItem key={p}>
									<SidebarMenuButton asChild>
										<Link
											from={Route.fullPath}
											activeProps={{ className: "bg-accent" }}
											to="./$problemId"
											params={{ problemId: p.toString() }}
										>
											Problem {p}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}

function RouteComponent() {
	return (
		<SidebarProvider defaultOpen={false}>
			<AppSidebar />
			<SidebarInset>
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
