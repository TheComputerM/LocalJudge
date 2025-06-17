import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
				Admin Dashboard
			</h1>
			{/* TODO: add card for no. of contests */}
			{/* TODO: add card for no. of users */}
			{/* TODO: add card for no. of submissions */}
		</div>
	);
}
