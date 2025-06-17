import { treaty } from "@elysiajs/eden";
import type { App } from ".";

export const appClient = treaty<App>(window.location.host);
