import { defineSharePointActionModule } from "../../action-module";

import { CreateSPSiteColumnAction } from "./action";
import { createSPSiteColumnSchema } from "./schema";

export { CreateSPSiteColumnAction } from "./action";
export { createSPSiteColumnSchema, type CreateSPSiteColumnPayload } from "./schema";

export const createSPSiteColumnActionModule = defineSharePointActionModule({
  verb: "createSPSiteColumn",
  schema: createSPSiteColumnSchema,
  definition: new CreateSPSiteColumnAction(),
  placements: ["siteSubaction"] as const,
});

