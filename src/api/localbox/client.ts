import { createFetch, createSchema } from "@better-fetch/fetch";
import { Type } from "@sinclair/typebox";
import { Compile } from "@sinclair/typemap";
import env from "@/lib/env";
import {
	LocalboxEngineInfoSchema,
	LocalboxFileSchema,
	LocalboxResultSchema,
	LocalboxSandboxOptions,
} from "./schema";

export const LocalboxExecuteSchema = Type.Object({
	files: Type.Array(LocalboxFileSchema),
	options: LocalboxSandboxOptions,
});

const schema = createSchema(
	{
		"@get/engine": {
			output: Compile(Type.Record(Type.String(), LocalboxEngineInfoSchema)),
		},
		"@post/engine/:engine": {},
		"@delete/engine/:engine": {},
		"@get/engine/:engine": {
			output: Compile(LocalboxEngineInfoSchema),
		},
		"@post/engine/:engine/execute": {
			input: Compile(LocalboxExecuteSchema),
			output: Compile(LocalboxResultSchema),
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
