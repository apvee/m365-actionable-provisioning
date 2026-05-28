import { defineSharePointActionModule } from "../../action-module";

import { AddSPFieldAction } from "./action";
import { addSPFieldSchema } from "./schema";

export { AddSPFieldAction } from "./action";
export { addSPFieldSchema, type AddSPFieldPayload } from "./schema";

export const addSPFieldActionModule = defineSharePointActionModule({
  verb: "addSPField",
  schema: addSPFieldSchema,
  definition: new AddSPFieldAction(),
  placements: ["listSubaction"] as const,
});

