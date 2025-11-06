import { clean, taskRunnerDB } from "./utils";

await clean(taskRunnerDB);

await taskRunnerDB.$client.close();
