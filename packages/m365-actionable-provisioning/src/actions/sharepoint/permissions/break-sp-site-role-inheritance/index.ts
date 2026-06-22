import { defineSharePointActionModule } from "../../action-module";

import { BreakSPSiteRoleInheritanceAction } from "./action";
import { breakSPSiteRoleInheritanceSchema } from "./schema";

export { BreakSPSiteRoleInheritanceAction } from "./action";
export { breakSPSiteRoleInheritanceSchema, type BreakSPSiteRoleInheritancePayload } from "./schema";

export const breakSPSiteRoleInheritanceActionModule = defineSharePointActionModule({
  verb: "breakSPSiteRoleInheritance",
  schema: breakSPSiteRoleInheritanceSchema,
  definition: new BreakSPSiteRoleInheritanceAction(),
  placements: ["siteSubaction"] as const,
});
