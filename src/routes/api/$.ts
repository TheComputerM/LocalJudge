import { app as api } from "@/api";
import { createServerFileRoute } from "@tanstack/react-start/server";

const handle = ({ request }: { request: Request }) => api.handle(request);

export const ServerRoute = createServerFileRoute("/api/$").methods({
	GET: handle,
	POST: handle,
});
