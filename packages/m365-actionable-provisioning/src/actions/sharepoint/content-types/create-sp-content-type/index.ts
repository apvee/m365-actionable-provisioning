import { defineSharePointActionModule } from "../../action-module";

import { CreateSPContentTypeAction } from "./action";
import { createSPContentTypeSchema } from "./schema";

export { CreateSPContentTypeAction } from "./action";
export { createSPContentTypeSchema, type CreateSPContentTypePayload } from "./schema";

export const createSPContentTypeActionModule = defineSharePointActionModule({
  verb: "createSPContentType",
  schema: createSPContentTypeSchema,
  definition: new CreateSPContentTypeAction(),
  placements: ["root", "siteSubaction"] as const,
});
