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
import { rejectError } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/contest/$id/problem")({
	beforeLoad: async ({ params, abortController }) => {
		const problems = await rejectError(
			localjudge
				.contest({ id: params.id })
				.problem.get({ fetch: { signal: abortController.signal } }),
		);
		return { problems };
	},
	loader: ({ context }) => context.problems,
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
											activeProps={{ "data-active": "true" }}
											to="./$problem"
											params={{ problem: problem.number.toString() }}
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
