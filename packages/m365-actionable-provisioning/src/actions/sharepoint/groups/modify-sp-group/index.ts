import { defineSharePointActionModule } from "../../action-module";
import { ModifySPGroupAction } from "./action";
import { modifySPGroupSchema } from "./schema";

export { ModifySPGroupAction } from "./action";
export { modifySPGroupSchema, type ModifySPGroupPayload } from "./schema";

export const modifySPGroupActionModule = defineSharePointActionModule({
  verb: "modifySPGroup",
  schema: modifySPGroupSchema,
  definition: new ModifySPGroupAction(),
  placements: ["siteSubaction"] as const,
});
