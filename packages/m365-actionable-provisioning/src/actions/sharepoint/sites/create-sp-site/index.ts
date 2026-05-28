import { defineSharePointActionModule } from "../../action-module";

import { CreateSPSiteAction } from "./action";
import { createSPSiteSchema } from "./schema";

export { CreateSPSiteAction } from "./action";
export { createSPSiteSchema, type CreateSPSitePayload } from "./schema";

export const createSPSiteActionModule = defineSharePointActionModule({
  verb: "createSPSite",
  schema: createSPSiteSchema,
  definition: new CreateSPSiteAction(),
  placements: ["root"] as const,
});

