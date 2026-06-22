import { defineSharePointActionModule } from "../../action-module";

import { DeleteSPContentTypeAction } from "./action";
import { deleteSPContentTypeSchema } from "./schema";

export { DeleteSPContentTypeAction } from "./action";
export { deleteSPContentTypeSchema, type DeleteSPContentTypePayload } from "./schema";

export const deleteSPContentTypeActionModule = defineSharePointActionModule({
  verb: "deleteSPContentType",
  schema: deleteSPContentTypeSchema,
  definition: new DeleteSPContentTypeAction(),
  placements: ["root", "siteSubaction"] as const,
});
