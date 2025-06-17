import { createServerFileRoute } from "@tanstack/react-start/server";
import { baseApp } from "@/api";

const handle = ({ request }: { request: Request }) => baseApp.handle(request);

export const ServerRoute = createServerFileRoute("/api/$").methods({
	GET: handle,
	POST: handle,
});
