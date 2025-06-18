import Elysia from "elysia";
import { betterAuthPlugin } from "./better-auth";

export const userApp = new Elysia({ prefix: "/user" })
	.use(betterAuthPlugin)
	.get("/", ({ auth }) => auth, {
		auth: "any",
	});
