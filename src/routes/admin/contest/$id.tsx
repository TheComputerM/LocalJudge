import {
	createFileRoute,
	Link,
	linkOptions,
	Outlet,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/contest/$id")({
	component: RouteComponent,
});

const links = linkOptions([
	{
		// TODO: fix this to be better
		from: "/admin/contest/$id/problem",
		to: "..",
		activeOptions: { exact: true },
		label: "Settings",
	},
	{ from: Route.fullPath, to: "./problem", label: "Problems" },
]);

function Navbar() {
	return (
		<div className="flex border-b pb-4 gap-2">
			{links.map((link) => (
				<Button
					key={link.label}
					asChild
					variant="link"
					size="sm"
					className="text-muted-foreground"
				>
					<Link
						{...link}
						activeProps={{ className: "bg-secondary text-primary" }}
					>
						{link.label}
					</Link>
				</Button>
			))}
		</div>
	);
}

function RouteComponent() {
	return (
		<>
			<Navbar />
			<br />
			<Outlet />
		</>
	);
}
