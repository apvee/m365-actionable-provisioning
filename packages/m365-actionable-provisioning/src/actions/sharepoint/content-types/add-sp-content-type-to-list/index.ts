import { defineSharePointActionModule } from "../../action-module";

import { AddSPContentTypeToListAction } from "./action";
import { addSPContentTypeToListSchema } from "./schema";

export { AddSPContentTypeToListAction } from "./action";
export { addSPContentTypeToListSchema, type AddSPContentTypeToListPayload } from "./schema";

export const addSPContentTypeToListActionModule = defineSharePointActionModule({
  verb: "addSPContentTypeToList",
  schema: addSPContentTypeToListSchema,
  definition: new AddSPContentTypeToListAction(),
  placements: ["listSubaction"] as const,
});
