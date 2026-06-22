import { defineSharePointActionModule } from "../../action-module";

import { RemoveSPListRoleAssignmentAction } from "./action";
import { removeSPListRoleAssignmentSchema } from "./schema";

export { RemoveSPListRoleAssignmentAction } from "./action";
export { removeSPListRoleAssignmentSchema, type RemoveSPListRoleAssignmentPayload } from "./schema";

export const removeSPListRoleAssignmentActionModule = defineSharePointActionModule({
  verb: "removeSPListRoleAssignment",
  schema: removeSPListRoleAssignmentSchema,
  definition: new RemoveSPListRoleAssignmentAction(),
  placements: ["listSubaction"] as const,
});
