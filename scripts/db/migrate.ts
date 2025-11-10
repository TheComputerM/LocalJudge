import { setup } from "@/db/utils";
import { taskRunnerDB } from "./utils";

await setup(taskRunnerDB);

await taskRunnerDB.$client.end();
