import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type EdenResponse = { data: any; error: null } | { data: null; error: any };

/**
 * A wrapper for the Eden API response to be used with SWR.
 *
 * ```ts
 * const { data, error } = useSWR("key", localjudgeSWR(localjudge.something.get()));
 * ```
 */
export const rejectError = <T extends EdenResponse>(
	response: Promise<T>,
): Promise<NonNullable<T["data"]>> =>
	response.then(
		({ data, error }) =>
			new Promise((resolve, reject) => {
				if (error) reject(error);
				resolve(data);
			}),
	);
