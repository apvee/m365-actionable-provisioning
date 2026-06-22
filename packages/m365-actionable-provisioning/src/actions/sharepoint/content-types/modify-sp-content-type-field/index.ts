import { defineSharePointActionModule } from "../../action-module";

import { ModifySPContentTypeFieldAction } from "./action";
import { modifySPContentTypeFieldSchema } from "./schema";

export { ModifySPContentTypeFieldAction } from "./action";
export { modifySPContentTypeFieldSchema, type ModifySPContentTypeFieldPayload } from "./schema";

export const modifySPContentTypeFieldActionModule = defineSharePointActionModule({
  verb: "modifySPContentTypeField",
  schema: modifySPContentTypeFieldSchema,
  definition: new ModifySPContentTypeFieldAction(),
  placements: ["contentTypeSubaction"] as const,
});
