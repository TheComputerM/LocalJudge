import { treaty } from "@elysiajs/eden";
import { clientOnly, serverOnly } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { type App, baseApp } from ".";

const isServer = typeof window === "undefined";

const createClient = isServer
	? serverOnly(() =>
			treaty<App>(baseApp, { headers: () => getWebRequest().headers }),
		)
	: clientOnly(() =>
			treaty<App>(window.location.host, {
				fetch: {
					credentials: "include",
				},
			}),
		);

export const appClient = createClient();
