import { defineSharePointActionModule } from "../../action-module";

import { ModifySPListAction } from "./action";
import { modifySPListSchema } from "./schema";

export { ModifySPListAction } from "./action";
export { modifySPListSchema, type ModifySPListPayload } from "./schema";
export { buildModifyListUpdateProps, type BuiltListUpdateProps } from "./update-props";

export const modifySPListActionModule = defineSharePointActionModule({
  verb: "modifySPList",
  schema: modifySPListSchema,
  definition: new ModifySPListAction(),
  placements: ["root", "siteSubaction"] as const,
});

