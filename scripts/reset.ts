import { reset, taskRunnerDB } from "./utils";

await reset(taskRunnerDB);

await taskRunnerDB.$client.close();
