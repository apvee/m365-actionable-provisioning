import { defineSharePointActionModule } from "../../action-module";

import { ModifySPContentTypeAction } from "./action";
import { modifySPContentTypeSchema } from "./schema";

export { ModifySPContentTypeAction } from "./action";
export { modifySPContentTypeSchema, type ModifySPContentTypePayload } from "./schema";

export const modifySPContentTypeActionModule = defineSharePointActionModule({
  verb: "modifySPContentType",
  schema: modifySPContentTypeSchema,
  definition: new ModifySPContentTypeAction(),
  placements: ["root", "siteSubaction"] as const,
});
