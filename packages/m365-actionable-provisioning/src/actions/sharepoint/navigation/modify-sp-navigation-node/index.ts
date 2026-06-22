import { defineSharePointActionModule } from "../../action-module";
import { ModifySPNavigationNodeAction } from "./action";
import { modifySPNavigationNodeSchema } from "./schema";

export { ModifySPNavigationNodeAction } from "./action";
export { modifySPNavigationNodeSchema, type ModifySPNavigationNodePayload } from "./schema";

export const modifySPNavigationNodeActionModule = defineSharePointActionModule({
  verb: "modifySPNavigationNode",
  schema: modifySPNavigationNodeSchema,
  definition: new ModifySPNavigationNodeAction(),
  placements: ["siteSubaction"] as const,
});
