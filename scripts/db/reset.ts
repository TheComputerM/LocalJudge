import { clean, setup } from "@/db/utils";
import { taskRunnerDB } from "./utils";

await clean(taskRunnerDB);
await setup(taskRunnerDB);

await taskRunnerDB.$client.close();
