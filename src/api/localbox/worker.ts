import { Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { $localbox } from "./client";
import { LocalboxFileSchema, LocalboxSandboxOptions } from "./schema";

const worker = self as unknown as Worker;

worker.onmessage = async (event) => {
	const { files, options, engine, ...identifiers } = Value.Parse(
		Type.Object({
			id: Type.String(),
			testcase: Type.Number(),
			engine: Type.String(),
			files: Type.Array(LocalboxFileSchema),
			options: LocalboxSandboxOptions,
		}),
		event.data,
	);
	const result = await $localbox("@post/engine/:engine/execute", {
		params: { engine },
		body: { files, options },
	});

	postMessage({ ...identifiers, result });
};
