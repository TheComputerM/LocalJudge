import outfitFontCss from "@fontsource-variable/outfit?url";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { getThemeFn } from "@/lib/server/theme";
import appCss from "@/styles/app.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "LocalJudge",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: outfitFontCss,
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	loader: async () => ({
		theme: await getThemeFn(),
	}),
	component: RootComponent,
	notFoundComponent: () => <div>404 Not Found</div>,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
			<TanStackRouterDevtools position="bottom-right" />
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	const theme = Route.useLoaderData({ select: (data) => data.theme });
	return (
		<html className={theme} lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
