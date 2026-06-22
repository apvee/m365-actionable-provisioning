import { defineSharePointActionModule } from "../../action-module";

import { CreateSPListViewAction } from "./action";
import { createSPListViewSchema } from "./schema";

export { CreateSPListViewAction } from "./action";
export { createSPListViewSchema, type CreateSPListViewPayload } from "./schema";

export const createSPListViewActionModule = defineSharePointActionModule({
  verb: "createSPListView",
  schema: createSPListViewSchema,
  definition: new CreateSPListViewAction(),
  placements: ["listSubaction"] as const,
});
