import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { localjudge } from "@/api/client";
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
	loader: async ({ params }) => {
		const { data, error } = await localjudge.api
			.contest({ id: params.contestId })
			.get();
		if (error) throw error;
		return data;
	},
	component: RouteComponent,
});

function AppSidebar() {
	const problems = Route.useLoaderData({ select: (data) => data.problems });
	return (
		<Sidebar variant="floating">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Problems</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{problems.map((p) => (
								<SidebarMenuItem key={p.id}>
									<SidebarMenuButton asChild>
										<Link
											from={Route.fullPath}
											activeProps={{ className: "bg-accent" }}
											to="./$problemId"
											params={{ problemId: p.id }}
										>
											{p.title}
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
