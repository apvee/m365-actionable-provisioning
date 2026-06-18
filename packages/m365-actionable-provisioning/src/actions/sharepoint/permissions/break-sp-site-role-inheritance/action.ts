import { SharePointPermissionAction } from "../_shared/action-factory";
import { breakSPSiteRoleInheritanceSchema } from "./schema";

export class BreakSPSiteRoleInheritanceAction extends SharePointPermissionAction<
  "breakSPSiteRoleInheritance",
  typeof breakSPSiteRoleInheritanceSchema
> {
  constructor() {
    super({
      verb: "breakSPSiteRoleInheritance",
      schema: breakSPSiteRoleInheritanceSchema,
      targetKind: "site",
      operation: "break",
    });
  }
}
