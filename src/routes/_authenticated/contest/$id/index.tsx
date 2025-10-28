import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/contest/$id/")({
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/contest/$id/problem", params });
	},
});

// TODO: add contest waiting area page
