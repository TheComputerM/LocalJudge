import { auth } from "@/lib/auth";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

export const app = new Elysia({ prefix: "/api" })
	.use(
		// visit `/swagger` to view generated documentation
		swagger(),
	)
	.mount(auth.handler)
	.get("/", () => "Hello Elysia");
