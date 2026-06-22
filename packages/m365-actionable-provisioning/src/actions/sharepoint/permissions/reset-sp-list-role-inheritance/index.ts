import { defineSharePointActionModule } from "../../action-module";

import { ResetSPListRoleInheritanceAction } from "./action";
import { resetSPListRoleInheritanceSchema } from "./schema";

export { ResetSPListRoleInheritanceAction } from "./action";
export { resetSPListRoleInheritanceSchema, type ResetSPListRoleInheritancePayload } from "./schema";

export const resetSPListRoleInheritanceActionModule = defineSharePointActionModule({
  verb: "resetSPListRoleInheritance",
  schema: resetSPListRoleInheritanceSchema,
  definition: new ResetSPListRoleInheritanceAction(),
  placements: ["listSubaction"] as const,
});
