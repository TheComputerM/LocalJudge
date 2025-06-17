import { parseArgs } from "node:util";
import { z } from "zod/v4";

const { values } = parseArgs({
	args: Bun.argv,
	options: {
		config: {
			type: "string",
			multiple: false,
		},
	},
	strict: false,
});

const configSchema = z.object({});
