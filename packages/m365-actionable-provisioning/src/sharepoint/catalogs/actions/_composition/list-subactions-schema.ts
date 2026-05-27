import { z } from "zod";

import { addSPFieldActionModule } from "../fields/add-sp-field";
import { deleteSPFieldActionModule } from "../fields/delete-sp-field";
import { modifySPFieldActionModule } from "../fields/modify-sp-field";
import { enableSPListRatingActionModule } from "../lists/enable-sp-list-rating";

const listSubactionSchemas = [
  addSPFieldActionModule.schema,
  modifySPFieldActionModule.schemasByPlacement.listSubaction,
  deleteSPFieldActionModule.schemasByPlacement.listSubaction,
  enableSPListRatingActionModule.schema,
] as const;

export const listSubactionSchema = z.discriminatedUnion("verb", listSubactionSchemas);

