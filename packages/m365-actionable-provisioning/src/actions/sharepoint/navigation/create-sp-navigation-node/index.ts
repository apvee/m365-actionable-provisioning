import { defineSharePointActionModule } from "../../action-module";
import { CreateSPNavigationNodeAction } from "./action";
import { createSPNavigationNodeSchema } from "./schema";

export { CreateSPNavigationNodeAction } from "./action";
export { createSPNavigationNodeSchema, type CreateSPNavigationNodePayload } from "./schema";

export const createSPNavigationNodeActionModule = defineSharePointActionModule({
  verb: "createSPNavigationNode",
  schema: createSPNavigationNodeSchema,
  definition: new CreateSPNavigationNodeAction(),
  placements: ["siteSubaction"] as const,
});
