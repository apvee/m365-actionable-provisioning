import { SharePointPermissionAction } from "../_shared/action-factory";
import { breakSPListRoleInheritanceSchema } from "./schema";

export class BreakSPListRoleInheritanceAction extends SharePointPermissionAction<
  "breakSPListRoleInheritance",
  typeof breakSPListRoleInheritanceSchema
> {
  constructor() {
    super({
      verb: "breakSPListRoleInheritance",
      schema: breakSPListRoleInheritanceSchema,
      targetKind: "list",
      operation: "break",
    });
  }
}
