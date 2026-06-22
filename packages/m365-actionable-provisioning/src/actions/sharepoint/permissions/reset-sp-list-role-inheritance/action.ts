import { SharePointPermissionAction } from "../_shared/action-factory";
import { resetSPListRoleInheritanceSchema } from "./schema";

export class ResetSPListRoleInheritanceAction extends SharePointPermissionAction<
  "resetSPListRoleInheritance",
  typeof resetSPListRoleInheritanceSchema
> {
  constructor() {
    super({
      verb: "resetSPListRoleInheritance",
      schema: resetSPListRoleInheritanceSchema,
      targetKind: "list",
      operation: "reset",
    });
  }
}
