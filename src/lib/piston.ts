import { createFetch, createSchema } from "@better-fetch/fetch";
import { Type } from "@sinclair/typebox";
import { Compile } from "@sinclair/typemap";
import env from "./env";

/**
 * This schema is used for both adding and removing packages,
 */
const PackageAction = {
	input: Compile(
		Type.Object({
			language: Type.String(),
			version: Type.String(),
		}),
	),
	output: Compile(
		Type.Object({
			language: Type.String(),
			version: Type.String(),
		}),
	),
};

const ProcessResult = Type.Object({
	stdout: Type.String(),
	stderr: Type.String(),
	output: Type.String(),
	code: Type.Union([Type.Integer(), Type.Null()]),
	signal: Type.Union([Type.String(), Type.Null()]),
});

const schema = createSchema({
	"@post/execute": {
		input: Compile(
			Type.Object({
				language: Type.String(),
				version: Type.String(),
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
				stdin: Type.Optional(Type.String()),
				args: Type.Optional(Type.Array(Type.String())),
				run_timeout: Type.Optional(Type.Number()),
				run_memory_limit: Type.Optional(Type.Number()),
				compile_timeout: Type.Optional(Type.Number()),
				compile_memory_limit: Type.Optional(Type.Number()),
			}),
		),
		output: Compile(
			Type.Object({
				language: Type.String(),
				version: Type.String(),
				run: ProcessResult,
				compile: Type.Optional(ProcessResult),
			}),
		),
	},
	"@get/runtimes": {
		output: Compile(
			Type.Array(
				Type.Object({
					language: Type.String(),
					version: Type.String(),
					aliases: Type.Array(Type.String()),
					runtime: Type.Optional(Type.String()),
				}),
			),
		),
	},
	"@get/packages": {
		output: Compile(
			Type.Array(
				Type.Object({
					language: Type.String(),
					language_version: Type.String(),
					installed: Type.Boolean(),
				}),
			),
		),
	},
	"@post/packages": PackageAction,
	"@delete/packages": PackageAction,
});

export const piston = createFetch({
	baseURL: new URL("/api/v2", env.PISTON_URL).href,
	schema,
});
