import { defineSharePointActionModule } from "../../action-module";

import { RemoveSPFieldFromContentTypeAction } from "./action";
import { removeSPFieldFromContentTypeSchema } from "./schema";

export { RemoveSPFieldFromContentTypeAction } from "./action";
export { removeSPFieldFromContentTypeSchema, type RemoveSPFieldFromContentTypePayload } from "./schema";

export const removeSPFieldFromContentTypeActionModule = defineSharePointActionModule({
  verb: "removeSPFieldFromContentType",
  schema: removeSPFieldFromContentTypeSchema,
  definition: new RemoveSPFieldFromContentTypeAction(),
  placements: ["contentTypeSubaction"] as const,
});
