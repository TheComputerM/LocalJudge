import { createFetch, createSchema } from "@better-fetch/fetch";
import { Type } from "@sinclair/typebox";
import { Compile } from "@sinclair/typemap";
import env from "./env";

const schema = createSchema({
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
	"@post/packages": {
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
	},
	"@delete/packages": {
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
	},
});

export const piston = createFetch({
	baseURL: new URL("/api/v2", env.PISTON_URL).href,
	schema,
});
