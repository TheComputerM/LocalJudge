import { auth } from "@/lib/auth";
import Elysia from "elysia";

export const betterAuthPlugin = new Elysia({
	prefix: "/auth",
	name: "better-auth",
})
	.mount(auth.handler)
	.macro({
		auth: (role: "admin" | "user" | "any") => ({
			async resolve({ status, request: { headers } }) {
				const data = await auth.api.getSession({
					headers,
				});

				if (!data) return status(401);
				if (role !== "any" && data.user.role !== role) return status(403);

				return {
					auth: {
						user: data.user,
						session: data.session,
					},
				};
			},
		}),
	});
