import { t } from "elysia";

export namespace AdminModel {
	export const ListQuery = t.Partial(
		t.Object({
			page: t.Number({
				default: 1,
				minimum: 1,
				description: "The page number to retrieve.",
			}),
			pageSize: t.Number({
				default: 20,
				minimum: 1,
				maximum: 100,
				description: "The number of items per page.",
			}),
		}),
	);
}
