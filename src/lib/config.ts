import { parseArgs } from "node:util";

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
