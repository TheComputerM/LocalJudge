import Elysia from "elysia";
import { betterAuthPlugin } from "@/api/better-auth";
import { AdminService } from "../services/admin";
import { adminContestApp } from "./contest";

export const adminApp = new Elysia({
	prefix: "/admin",
	detail: { tags: ["Admin"] },
})
	.use(betterAuthPlugin)
	.guard({ auth: "admin" })
	.get(
		"/overview",
		async () => {
			return AdminService.getOverview();
		},
		{
			detail: {
				summary: "Get admin overview",
				description:
					"Get an overview of the admin statistics including contests, participants, and submissions",
			},
		},
	)
	.use(adminContestApp);
