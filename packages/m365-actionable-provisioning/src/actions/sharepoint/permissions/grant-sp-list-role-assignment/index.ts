import { defineSharePointActionModule } from "../../action-module";

import { GrantSPListRoleAssignmentAction } from "./action";
import { grantSPListRoleAssignmentSchema } from "./schema";

export { GrantSPListRoleAssignmentAction } from "./action";
export { grantSPListRoleAssignmentSchema, type GrantSPListRoleAssignmentPayload } from "./schema";

export const grantSPListRoleAssignmentActionModule = defineSharePointActionModule({
  verb: "grantSPListRoleAssignment",
  schema: grantSPListRoleAssignmentSchema,
  definition: new GrantSPListRoleAssignmentAction(),
  placements: ["listSubaction"] as const,
});
