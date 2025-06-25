import { createFetch, createSchema } from "@better-fetch/fetch";
import { Type } from "@sinclair/typebox";
import { Compile } from "@sinclair/typemap";

const schema = createSchema({
	"@get/languages": {
		output: Compile(
			Type.Array(
				Type.Object({
					id: Type.Number(),
					name: Type.String(),
				}),
			),
		),
	},
	"@get/languages/:id": {
		params: Compile(
			Type.Object({
				id: Type.Number(),
			}),
		),
		output: Compile(
			Type.Object({
				id: Type.Number(),
				name: Type.String(),
				is_archived: Type.Boolean(),
			}),
		),
	},
});

/**
 * Fetch client for Judge0 API.
 * Visit https://ce.judge0.com/docs for the full API documentation.
 */
export const judge0 = createFetch({
	baseURL: "http://localhost:2358/",
	schema,
});
