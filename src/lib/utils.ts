import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type ReponseWithError = { data: any; error: null } | { data: null; error: any };
/**
 * A wrapper for promises that return error as a value, to make them
 * reject the error
 *
 * can also be used with TanStack Query
 *
 * ```ts
 * const { data, error } = useQuery({
 *   queryKey: ["key"],
 *   queryFn: () => rejectError(localjudge.something.get())
 * });
 * ```
 */
export const rejectError = <T extends ReponseWithError>(
	response: Promise<T>,
): Promise<NonNullable<T["data"]>> =>
	response.then(
		({ data, error }) =>
			new Promise((resolve, reject) => {
				if (error) reject(error);
				resolve(data);
			}),
	);
