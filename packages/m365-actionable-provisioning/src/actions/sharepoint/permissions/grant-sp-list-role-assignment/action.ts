import { SharePointPermissionAction } from "../_shared/action-factory";
import { grantSPListRoleAssignmentSchema } from "./schema";

export class GrantSPListRoleAssignmentAction extends SharePointPermissionAction<
  "grantSPListRoleAssignment",
  typeof grantSPListRoleAssignmentSchema
> {
  constructor() {
    super({
      verb: "grantSPListRoleAssignment",
      schema: grantSPListRoleAssignmentSchema,
      targetKind: "list",
      operation: "grant",
    });
  }
}
