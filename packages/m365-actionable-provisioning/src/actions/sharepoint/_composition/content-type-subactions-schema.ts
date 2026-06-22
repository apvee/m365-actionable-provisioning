import { z } from "zod";

import { addSPFieldToContentTypeActionModule } from "../content-types/add-sp-field-to-content-type";
import { modifySPContentTypeFieldActionModule } from "../content-types/modify-sp-content-type-field";
import { removeSPFieldFromContentTypeActionModule } from "../content-types/remove-sp-field-from-content-type";

const contentTypeSubactionSchemas = [
  addSPFieldToContentTypeActionModule.schema,
  modifySPContentTypeFieldActionModule.schema,
  removeSPFieldFromContentTypeActionModule.schema,
] as const;

export const contentTypeSubactionSchema = z.discriminatedUnion("verb", contentTypeSubactionSchemas);
