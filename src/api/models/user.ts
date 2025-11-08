import { user } from "@/db/schema";
import { createSelectSchema } from ".";

const _select = createSelectSchema(user);

export namespace UserModel {
	export const select = _select;
}
