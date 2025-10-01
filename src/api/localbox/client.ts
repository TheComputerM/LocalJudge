import { createFetch, createSchema } from "@better-fetch/fetch";
import { Type } from "@sinclair/typebox";
import { Compile } from "@sinclair/typemap";
import env from "@/lib/env";

export const LocalboxExecuteSchema = Type.Object({
	files: Type.Array(
		Type.Object({
			name: Type.Optional(Type.String()),
			content: Type.String(),
			encoding: Type.Optional(
				Type.Union([
					Type.Literal("utf8"),
					Type.Literal("hex"),
					Type.Literal("base64"),
				]),
			),
		}),
	),
	options: Type.Partial(
		Type.Object({
			stdin: Type.String(),
			environment: Type.Record(Type.String(), Type.String()),
			buffer_limit: Type.Integer(),
			time_limit: Type.Integer(),
			wall_time_limit: Type.Integer(),
		}),
	),
});

export const LocalboxResultSchema = Type.Object({
	exit_code: Type.Integer(),
	max_rss: Type.Integer(),
	memory: Type.Number(),
	message: Type.String(),
	status: Type.String(),
	stdout: Type.String(),
	stderr: Type.String(),
	time: Type.Number(),
	wall_time: Type.Number(),
});

const LocalboxPackage = Type.Object({
	run_file: Type.String(),
	version: Type.String(),
	installed: Type.Boolean(),
});

const schema = createSchema({
	"@get/engine": {
		output: Compile(Type.Record(Type.String(), LocalboxPackage)),
	},
	"@post/engine/:engine": {},
	"@delete/engine/:engine": {},
	"@get/engine/:engine": {
		output: Compile(LocalboxPackage),
	},
	"@post/engine/:engine/execute": {
		input: Compile(LocalboxExecuteSchema),
		output: Compile(LocalboxResultSchema),
	},
});

export const $localbox = createFetch({
	baseURL: env.LOCALBOX_URL,
	schema,
});
