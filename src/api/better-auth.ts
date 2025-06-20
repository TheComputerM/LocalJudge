import Elysia from "elysia";
import { auth } from "@/lib/auth";

export const betterAuthPlugin = new Elysia({
	name: "better-auth",
}).macro({
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
