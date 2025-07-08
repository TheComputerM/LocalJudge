import { edenFetch } from "@elysiajs/eden";
import { App } from ".";

export const $localjudge = edenFetch<App>("http://localhost:3000", {
	credentials: "include",
});
