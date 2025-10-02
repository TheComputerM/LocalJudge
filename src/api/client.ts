import { type Treaty, treaty } from "@elysiajs/eden";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { type App, baseApp } from ".";

const createClient = createIsomorphicFn()
	.server(() => treaty<App>(baseApp, { headers: () => getRequest().headers }))
	.client(() =>
		treaty<App>(window.location.host, {
			fetch: {
				credentials: "include",
			},
		}),
	);

export const localjudge: Treaty.Create<App> = createClient();
