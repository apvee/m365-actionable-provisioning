import { defineSharePointActionModule } from "../../action-module";

import { ModifySPSiteAction } from "./action";
import { modifySPSiteSchema } from "./schema";

export { ModifySPSiteAction } from "./action";
export { modifySPSiteSchema, type ModifySPSitePayload } from "./schema";

export const modifySPSiteActionModule = defineSharePointActionModule({
  verb: "modifySPSite",
  schema: modifySPSiteSchema,
  definition: new ModifySPSiteAction(),
  placements: ["root"] as const,
});

