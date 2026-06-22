import { defineSharePointActionModule } from "../../action-module";

import { ResetSPSiteRoleInheritanceAction } from "./action";
import { resetSPSiteRoleInheritanceSchema } from "./schema";

export { ResetSPSiteRoleInheritanceAction } from "./action";
export { resetSPSiteRoleInheritanceSchema, type ResetSPSiteRoleInheritancePayload } from "./schema";

export const resetSPSiteRoleInheritanceActionModule = defineSharePointActionModule({
  verb: "resetSPSiteRoleInheritance",
  schema: resetSPSiteRoleInheritanceSchema,
  definition: new ResetSPSiteRoleInheritanceAction(),
  placements: ["siteSubaction"] as const,
});
