declare var self: Worker;

import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { piston } from "@/lib/piston";
import { rejectError } from "@/lib/utils";

const schema = t.Object({
	submission: t.String(),
	testcase: t.Number(),
	language: t.String(),
	code: t.String(),
	stdin: t.String(),
});

self.onmessage = async (event: MessageEvent) => {
	const payload = Value.Parse(schema, event.data);
	const [language, version] = payload.language.split("@");
	const data = await rejectError(
		piston("@post/execute", {
			body: {
				language,
				version,
				stdin: payload.stdin,
				files: [{ content: payload.code }],
			},
		}),
	);

	self.postMessage(data);
};
