import Elysia from "elysia";
import { auth } from "@/lib/auth";

export const betterAuthPlugin = new Elysia({
	name: "better-auth",
}).macro({
	auth: (role: string) => ({
		async resolve({ status, request: { headers } }) {
			const data = await auth.api.getSession({
				headers,
			});

			if (!data) return status(401);
			if (role !== "any" && !data.user.role?.includes(role)) return status(403);

			return {
				auth: data,
			};
		},
	}),
});
