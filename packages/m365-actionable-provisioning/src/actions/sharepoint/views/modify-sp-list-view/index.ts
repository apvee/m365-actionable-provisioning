import { defineSharePointActionModule } from "../../action-module";

import { ModifySPListViewAction } from "./action";
import { modifySPListViewSchema } from "./schema";

export { ModifySPListViewAction } from "./action";
export { modifySPListViewSchema, type ModifySPListViewPayload } from "./schema";

export const modifySPListViewActionModule = defineSharePointActionModule({
  verb: "modifySPListView",
  schema: modifySPListViewSchema,
  definition: new ModifySPListViewAction(),
  placements: ["listSubaction"] as const,
});
