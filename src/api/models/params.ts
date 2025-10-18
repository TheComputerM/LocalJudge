import { t } from "elysia";

export namespace APIParams {
	export const contest = t.String({ description: "Contest ID" });
	export const problem = t.Number({ description: "Problem" });
	export const testcase = t.Number({
		description: "Testcase number within the problem",
	});
}
