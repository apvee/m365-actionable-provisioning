import { defineSharePointActionModule } from "../../action-module";

import { DeleteSPListAction } from "./action";
import { deleteSPListSchema } from "./schema";

export { DeleteSPListAction } from "./action";
export { deleteSPListSchema, type DeleteSPListPayload } from "./schema";

export const deleteSPListActionModule = defineSharePointActionModule({
  verb: "deleteSPList",
  schema: deleteSPListSchema,
  definition: new DeleteSPListAction(),
  placements: ["root", "siteSubaction"] as const,
});

