import { defineSharePointActionModule } from "../../action-module";

import { ModifySPFieldAction } from "./action";
import { modifySPFieldSchema, modifySPFieldSchema_List, modifySPFieldSchema_Site } from "./schema";

export { ModifySPFieldAction } from "./action";
export { modifySPFieldSchema, modifySPFieldSchema_List, modifySPFieldSchema_Site, type ModifySPFieldPayload } from "./schema";

export const modifySPFieldActionModule = defineSharePointActionModule({
  verb: "modifySPField",
  schema: modifySPFieldSchema,
  schemasByPlacement: {
    siteSubaction: modifySPFieldSchema_Site,
    listSubaction: modifySPFieldSchema_List,
  },
  definition: new ModifySPFieldAction(),
  placements: ["siteSubaction", "listSubaction"] as const,
});
