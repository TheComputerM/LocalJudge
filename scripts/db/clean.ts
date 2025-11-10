import { clean } from "@/db/utils";
import { taskRunnerDB } from "./utils";

await clean(taskRunnerDB);

await taskRunnerDB.$client.close();
