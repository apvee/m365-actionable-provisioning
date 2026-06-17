import { defineSharePointActionModule } from "../../action-module";

import { AddSPFieldToContentTypeAction } from "./action";
import { addSPFieldToContentTypeSchema } from "./schema";

export { AddSPFieldToContentTypeAction } from "./action";
export { addSPFieldToContentTypeSchema, type AddSPFieldToContentTypePayload } from "./schema";

export const addSPFieldToContentTypeActionModule = defineSharePointActionModule({
  verb: "addSPFieldToContentType",
  schema: addSPFieldToContentTypeSchema,
  definition: new AddSPFieldToContentTypeAction(),
  placements: ["contentTypeSubaction"] as const,
});
