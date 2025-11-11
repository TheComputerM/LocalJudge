import { createRouter, ErrorComponent, Link } from "@tanstack/react-router";
import { LucideCode, LucideHome } from "lucide-react";
import { Button } from "./components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "./components/ui/empty";
import { routeTree } from "./routeTree.gen";

export function NotFoundPage() {
	return (
		<div className="flex w-full items-center justify-center">
			<div className="flex h-dvh items-center border-x">
				<div>
					<div className="absolute inset-x-0 h-px bg-border" />
					<Empty>
						<EmptyHeader>
							<EmptyTitle className="font-black font-mono text-8xl">
								404
							</EmptyTitle>
							<EmptyDescription className="text-nowrap">
								The page you're looking for might have been <br />
								moved or doesn't exist.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<div className="flex gap-2">
								<Button render={<Link to="/" />}>
									<LucideHome /> Home
								</Button>

								<Button render={<Link to="/app" />} variant="outline">
									<LucideCode /> Contests
								</Button>
							</div>
						</EmptyContent>
					</Empty>
					<div className="absolute inset-x-0 h-px bg-border" />
				</div>
			</div>
		</div>
	);
}

export function getRouter() {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultErrorComponent: ErrorComponent,
		defaultNotFoundComponent: NotFoundPage,
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
