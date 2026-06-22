import { defineSharePointActionModule } from "../../action-module";

import { DeleteSPListViewAction } from "./action";
import { deleteSPListViewSchema } from "./schema";

export { DeleteSPListViewAction } from "./action";
export { deleteSPListViewSchema, type DeleteSPListViewPayload } from "./schema";

export const deleteSPListViewActionModule = defineSharePointActionModule({
  verb: "deleteSPListView",
  schema: deleteSPListViewSchema,
  definition: new DeleteSPListViewAction(),
  placements: ["listSubaction"] as const,
});
