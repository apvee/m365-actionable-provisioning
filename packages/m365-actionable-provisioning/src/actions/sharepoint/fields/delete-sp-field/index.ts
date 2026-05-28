import { defineSharePointActionModule } from "../../action-module";

import { DeleteSPFieldAction } from "./action";
import { deleteSPFieldSchema, deleteSPFieldSchema_List, deleteSPFieldSchema_Site } from "./schema";

export { DeleteSPFieldAction } from "./action";
export { deleteSPFieldSchema, deleteSPFieldSchema_List, deleteSPFieldSchema_Site, type DeleteSPFieldPayload } from "./schema";

export const deleteSPFieldActionModule = defineSharePointActionModule({
  verb: "deleteSPField",
  schema: deleteSPFieldSchema,
  schemasByPlacement: {
    siteSubaction: deleteSPFieldSchema_Site,
    listSubaction: deleteSPFieldSchema_List,
  },
  definition: new DeleteSPFieldAction(),
  placements: ["siteSubaction", "listSubaction"] as const,
});
