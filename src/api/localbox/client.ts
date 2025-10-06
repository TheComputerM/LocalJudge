import { createFetch, createSchema } from "@better-fetch/fetch";
import { Type } from "@sinclair/typebox";
import { Compile } from "@sinclair/typemap";
import env from "@/lib/env";
import { LocalboxSchema } from "./schema";

const schema = createSchema(
	{
		"@get/engine": {
			output: Compile(Type.Record(Type.String(), LocalboxSchema.EngineInfo)),
		},
		"@post/engine/:engine": {},
		"@delete/engine/:engine": {},
		"@get/engine/:engine": {
			output: Compile(LocalboxSchema.EngineInfo),
		},
		"@post/engine/:engine/execute": {
			input: Compile(
				Type.Object({
					files: Type.Array(LocalboxSchema.File),
					options: LocalboxSchema.PhaseOptions,
				}),
			),
			output: Compile(LocalboxSchema.Result),
		},
	},
	{
		strict: true,
	},
);

export const $localbox = createFetch({
	throw: true,
	baseURL: env.LOCALBOX_URL,
	schema,
});
