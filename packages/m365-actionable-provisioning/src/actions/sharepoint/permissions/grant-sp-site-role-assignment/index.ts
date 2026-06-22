import { defineSharePointActionModule } from "../../action-module";

import { GrantSPSiteRoleAssignmentAction } from "./action";
import { grantSPSiteRoleAssignmentSchema } from "./schema";

export { GrantSPSiteRoleAssignmentAction } from "./action";
export { grantSPSiteRoleAssignmentSchema, type GrantSPSiteRoleAssignmentPayload } from "./schema";

export const grantSPSiteRoleAssignmentActionModule = defineSharePointActionModule({
  verb: "grantSPSiteRoleAssignment",
  schema: grantSPSiteRoleAssignmentSchema,
  definition: new GrantSPSiteRoleAssignmentAction(),
  placements: ["siteSubaction"] as const,
});
