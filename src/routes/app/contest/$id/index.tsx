import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/contest/$id/")({
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/app/contest/$id/problem", params });
	},
});

// TODO: add contest waiting area page
