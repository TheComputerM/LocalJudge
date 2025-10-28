import { Type } from "@sinclair/typebox";
import { Compile } from "@sinclair/typemap";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/login-form";
import { getAuthFn } from "@/lib/auth/utils";

export const Route = createFileRoute("/login")({
	validateSearch: Compile(
		Type.Object({
			redirect: Type.Optional(Type.String()),
		}),
	),
	beforeLoad: async ({ search }) => {
		const auth = await getAuthFn();
		if (auth) {
			const isAdmin = auth.user.role?.includes("admin");
			let redirectPath = search.redirect ?? (isAdmin ? "/admin" : "/app");

			// If the user is not an admin but the redirect path
			// includes "admin", redirect to "/app"
			if (redirectPath.includes("admin") && !isAdmin) {
				redirectPath = "/app";
			}

			throw redirect({
				to: redirectPath,
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex h-screen items-center justify-center bg-muted">
			<LoginForm />
		</div>
	);
}
