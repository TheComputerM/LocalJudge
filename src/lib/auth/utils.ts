import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from ".";

export const getAuthFn = createServerFn().handler(async () => {
	const data = await auth.api.getSession({
		headers: getRequest().headers,
	});
	return data;
});
