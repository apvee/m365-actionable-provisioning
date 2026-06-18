import { SharePointPermissionAction } from "../_shared/action-factory";
import { removeSPListRoleAssignmentSchema } from "./schema";

export class RemoveSPListRoleAssignmentAction extends SharePointPermissionAction<
  "removeSPListRoleAssignment",
  typeof removeSPListRoleAssignmentSchema
> {
  constructor() {
    super({
      verb: "removeSPListRoleAssignment",
      schema: removeSPListRoleAssignmentSchema,
      targetKind: "list",
      operation: "remove",
    });
  }
}
