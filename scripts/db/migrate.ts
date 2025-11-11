import { DatabaseUtils } from "@/db/utils";
import { taskRunnerDB } from "./utils";

await DatabaseUtils.setup(taskRunnerDB);

await taskRunnerDB.$client.end();
