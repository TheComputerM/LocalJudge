import { auth } from "@/lib/auth";
import Elysia from "elysia";

export const betterAuth = new Elysia({ name: "better-auth" }).macro({
	auth: (role: "admin" | "user") => ({
		async resolve({ status, request: { headers } }) {
			const session = await auth.api.getSession({
				headers,
			});

			if (!session) return status(401);
			if (session.user.role !== role) return status(403);

			return {
				user: session.user,
				session: session.session,
			};
		},
	}),
});
