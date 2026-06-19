import { defineSharePointActionModule } from "../../action-module";
import { DeleteSPNavigationNodeAction } from "./action";
import { deleteSPNavigationNodeSchema } from "./schema";

export { DeleteSPNavigationNodeAction } from "./action";
export { deleteSPNavigationNodeSchema, type DeleteSPNavigationNodePayload } from "./schema";

export const deleteSPNavigationNodeActionModule = defineSharePointActionModule({
  verb: "deleteSPNavigationNode",
  schema: deleteSPNavigationNodeSchema,
  definition: new DeleteSPNavigationNodeAction(),
  placements: ["siteSubaction"] as const,
});
