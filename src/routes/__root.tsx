/// <reference types="vite/client" />
import jetbrainsMonoFontCss from "@fontsource-variable/jetbrains-mono?url";
import outfitFontCss from "@fontsource-variable/outfit?url";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { getThemeFn } from "@/lib/server/theme";
import appCss from "@/styles/app.css?url";

const getAuthFn = createServerFn().handler(async () => {
	const data = await auth.api.getSession({
		headers: getRequest().headers,
	});
	return data;
});

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
				href: jetbrainsMonoFontCss,
			},
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	beforeLoad: async () => ({ auth: await getAuthFn() }),
	loader: async () => ({
		theme: await getThemeFn(),
	}),
	component: RootComponent,
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
		<html className={theme} lang="en" suppressHydrationWarning>
			<head>
				<script src="https://unpkg.com/react-scan/dist/auto.global.js" />
				<HeadContent />
			</head>
			<body>
				<ThemeProvider theme={theme}>
					{children}
					<Toaster position="top-center" />
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
