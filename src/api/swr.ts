type EdenResponse = { data: any; error: null } | { data: null; error: any };

/**
 * A wrapper for the Eden API response to be used with SWR.
 *
 * ```ts
 * const { data, error } = useSWR("key", localjudgeSWR(localjudge.something.get()));
 * ```
 */
export const localjudgeSWR =
	<T extends EdenResponse>(
		response: Promise<T>,
	): (() => Promise<NonNullable<T["data"]>>) =>
	() =>
		response.then(
			({ data, error }) =>
				new Promise((resolve, reject) => {
					if (error) reject(error);
					resolve(data);
				}),
		);
