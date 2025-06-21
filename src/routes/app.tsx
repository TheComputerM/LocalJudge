import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
	beforeLoad: async ({ location, context: { auth } }) => {
		if (!auth) {
			throw redirect({ to: "/login", search: { redirect: location.pathname } });
		}
	},
});
