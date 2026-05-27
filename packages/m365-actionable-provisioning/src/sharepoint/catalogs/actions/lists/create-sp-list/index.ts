import { defineSharePointActionModule } from "../../action-module";

import { CreateSPListAction } from "./action";
import { createSPListSchema } from "./schema";

export { CreateSPListAction } from "./action";
export { createSPListSchema, DraftVersionVisibility, type CreateSPListPayload } from "./schema";

export const createSPListActionModule = defineSharePointActionModule({
  verb: "createSPList",
  schema: createSPListSchema,
  definition: new CreateSPListAction(),
  placements: ["root", "siteSubaction"] as const,
});

