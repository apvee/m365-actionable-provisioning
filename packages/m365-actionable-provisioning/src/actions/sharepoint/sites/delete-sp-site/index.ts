import { defineSharePointActionModule } from "../../action-module";

import { DeleteSPSiteAction } from "./action";
import { deleteSPSiteSchema } from "./schema";

export { DeleteSPSiteAction } from "./action";
export { deleteSPSiteSchema, type DeleteSPSitePayload } from "./schema";

export const deleteSPSiteActionModule = defineSharePointActionModule({
  verb: "deleteSPSite",
  schema: deleteSPSiteSchema,
  definition: new DeleteSPSiteAction(),
  placements: ["root"] as const,
});

