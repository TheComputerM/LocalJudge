import { DatabaseUtils } from "@/db/utils";
import { taskRunnerDB } from "./utils";

await DatabaseUtils.clean(taskRunnerDB);

await taskRunnerDB.$client.close();
