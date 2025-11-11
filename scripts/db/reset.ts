import { DatabaseUtils } from "@/db/utils";
import { taskRunnerDB } from "./utils";

await DatabaseUtils.reset(taskRunnerDB);

await taskRunnerDB.$client.close();
