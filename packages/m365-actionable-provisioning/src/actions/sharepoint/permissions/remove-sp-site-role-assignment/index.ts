import { defineSharePointActionModule } from "../../action-module";

import { RemoveSPSiteRoleAssignmentAction } from "./action";
import { removeSPSiteRoleAssignmentSchema } from "./schema";

export { RemoveSPSiteRoleAssignmentAction } from "./action";
export { removeSPSiteRoleAssignmentSchema, type RemoveSPSiteRoleAssignmentPayload } from "./schema";

export const removeSPSiteRoleAssignmentActionModule = defineSharePointActionModule({
  verb: "removeSPSiteRoleAssignment",
  schema: removeSPSiteRoleAssignmentSchema,
  definition: new RemoveSPSiteRoleAssignmentAction(),
  placements: ["siteSubaction"] as const,
});
