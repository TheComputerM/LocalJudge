import { treaty } from "@elysiajs/eden";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { type App, baseApp } from ".";

const createClient = createIsomorphicFn()
	.server(() =>
		treaty<App>(baseApp, { headers: () => getWebRequest().headers }),
	)
	.client(() =>
		treaty<App>(window.location.host, {
			fetch: {
				credentials: "include",
			},
		}),
	);

export const localjudge = createClient();
