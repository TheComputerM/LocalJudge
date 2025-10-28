import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAuthFn } from "@/lib/auth/utils";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: async ({ location }) => {
		const auth = await getAuthFn();
		if (!auth) {
			throw redirect({ to: "/login", search: { redirect: location.pathname } });
		}
		return { auth };
	},
});
