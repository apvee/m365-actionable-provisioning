import { defineSharePointActionModule } from "../../action-module";
import { DeleteSPGroupAction } from "./action";
import { deleteSPGroupSchema } from "./schema";

export { DeleteSPGroupAction } from "./action";
export { deleteSPGroupSchema, type DeleteSPGroupPayload } from "./schema";

export const deleteSPGroupActionModule = defineSharePointActionModule({
  verb: "deleteSPGroup",
  schema: deleteSPGroupSchema,
  definition: new DeleteSPGroupAction(),
  placements: ["siteSubaction"] as const,
});
