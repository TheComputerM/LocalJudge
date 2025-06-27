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

export const Route = createFileRoute("/app/contest/$id/problem")({
	loader: async ({ context: { contest } }) => contest.problems,
	component: RouteComponent,
});

function AppSidebar() {
	const problems = Route.useLoaderData();

	return (
		<Sidebar variant="floating">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Problems</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{problems.map((problem) => (
								<SidebarMenuItem key={problem.number}>
									<SidebarMenuButton asChild>
										<Link
											from={Route.fullPath}
											activeProps={{ className: "bg-accent" }}
											to="./$number"
											params={{ number: problem.number.toString() }}
										>
											{problem.title}
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
