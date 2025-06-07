import { auth } from "@/lib/auth";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

const app = new Elysia()
	.use(
		// visit `/swagger` to view generated documentation
		swagger(),
	)
	.mount(auth.handler)
	.get("/", () => "Hello Elysia");

app.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
