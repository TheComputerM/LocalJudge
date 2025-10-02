import { createFileRoute } from "@tanstack/react-router";
import { baseApp } from "@/api";

const handle = ({ request }: { request: Request }) => baseApp.handle(request);

export const Route = createFileRoute("/api/$")({
	server: {
		handlers: {
			GET: handle,
			POST: handle,
			PUT: handle,
			DELETE: handle,
			PATCH: handle,
		},
	},
});
