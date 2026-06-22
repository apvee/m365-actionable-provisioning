import { SharePointPermissionAction } from "../_shared/action-factory";
import { grantSPSiteRoleAssignmentSchema } from "./schema";

export class GrantSPSiteRoleAssignmentAction extends SharePointPermissionAction<
  "grantSPSiteRoleAssignment",
  typeof grantSPSiteRoleAssignmentSchema
> {
  constructor() {
    super({
      verb: "grantSPSiteRoleAssignment",
      schema: grantSPSiteRoleAssignmentSchema,
      targetKind: "site",
      operation: "grant",
    });
  }
}
