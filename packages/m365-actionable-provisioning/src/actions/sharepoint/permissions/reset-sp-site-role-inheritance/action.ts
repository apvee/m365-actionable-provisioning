import { SharePointPermissionAction } from "../_shared/action-factory";
import { resetSPSiteRoleInheritanceSchema } from "./schema";

export class ResetSPSiteRoleInheritanceAction extends SharePointPermissionAction<
  "resetSPSiteRoleInheritance",
  typeof resetSPSiteRoleInheritanceSchema
> {
  constructor() {
    super({
      verb: "resetSPSiteRoleInheritance",
      schema: resetSPSiteRoleInheritanceSchema,
      targetKind: "site",
      operation: "reset",
    });
  }
}
