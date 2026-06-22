import { defineSharePointActionModule } from "../../action-module";

import { BreakSPListRoleInheritanceAction } from "./action";
import { breakSPListRoleInheritanceSchema } from "./schema";

export { BreakSPListRoleInheritanceAction } from "./action";
export { breakSPListRoleInheritanceSchema, type BreakSPListRoleInheritancePayload } from "./schema";

export const breakSPListRoleInheritanceActionModule = defineSharePointActionModule({
  verb: "breakSPListRoleInheritance",
  schema: breakSPListRoleInheritanceSchema,
  definition: new BreakSPListRoleInheritanceAction(),
  placements: ["listSubaction"] as const,
});
