import {
	createRouter as createTanStackRouter,
	ErrorComponent,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultErrorComponent: ErrorComponent,
		defaultNotFoundComponent: () => <div>404 not found</div>,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
