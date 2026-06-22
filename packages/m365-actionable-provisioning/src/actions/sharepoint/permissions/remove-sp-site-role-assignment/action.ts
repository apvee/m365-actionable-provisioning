import { SharePointPermissionAction } from "../_shared/action-factory";
import { removeSPSiteRoleAssignmentSchema } from "./schema";

export class RemoveSPSiteRoleAssignmentAction extends SharePointPermissionAction<
  "removeSPSiteRoleAssignment",
  typeof removeSPSiteRoleAssignmentSchema
> {
  constructor() {
    super({
      verb: "removeSPSiteRoleAssignment",
      schema: removeSPSiteRoleAssignmentSchema,
      targetKind: "site",
      operation: "remove",
    });
  }
}
