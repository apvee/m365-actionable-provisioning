import { defineSharePointActionModule } from "../../action-module";

import { EnableSPListRatingAction } from "./action";
import { enableSPListRatingSchema } from "./schema";

export { EnableSPListRatingAction } from "./action";
export { enableSPListRatingSchema, type EnableSPListRatingPayload } from "./schema";

export const enableSPListRatingActionModule = defineSharePointActionModule({
  verb: "enableSPListRating",
  schema: enableSPListRatingSchema,
  definition: new EnableSPListRatingAction(),
  placements: ["listSubaction"] as const,
});

