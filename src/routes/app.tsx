import { createFileRoute, redirect } from "@tanstack/react-router";
import { localjudge } from "@/api/client";

export const Route = createFileRoute("/app")({
	beforeLoad: async ({ location }) => {
		const { data } = await localjudge.api.user.get();
		if (!data) {
			throw redirect({ to: "/login", search: { redirect: location.pathname } });
		}
	},
});
