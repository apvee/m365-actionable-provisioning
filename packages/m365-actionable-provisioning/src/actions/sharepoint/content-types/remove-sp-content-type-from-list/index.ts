import { defineSharePointActionModule } from "../../action-module";

import { RemoveSPContentTypeFromListAction } from "./action";
import { removeSPContentTypeFromListSchema } from "./schema";

export { RemoveSPContentTypeFromListAction } from "./action";
export { removeSPContentTypeFromListSchema, type RemoveSPContentTypeFromListPayload } from "./schema";

export const removeSPContentTypeFromListActionModule = defineSharePointActionModule({
  verb: "removeSPContentTypeFromList",
  schema: removeSPContentTypeFromListSchema,
  definition: new RemoveSPContentTypeFromListAction(),
  placements: ["listSubaction"] as const,
});
