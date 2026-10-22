import { defineSharePointActionModule } from "../../action-module";
import { CreateSPGroupAction } from "./action";
import { createSPGroupSchema } from "./schema";

export { CreateSPGroupAction } from "./action";
export { createSPGroupSchema, type CreateSPGroupPayload } from "./schema";

export const createSPGroupActionModule = defineSharePointActionModule({
  verb: "createSPGroup",
  schema: createSPGroupSchema,
  definition: new CreateSPGroupAction(),
  placements: ["siteSubaction"] as const,
});
