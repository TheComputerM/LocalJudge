import { setup, taskRunnerDB } from "./utils";

await setup(taskRunnerDB);
await taskRunnerDB.$client.end();
