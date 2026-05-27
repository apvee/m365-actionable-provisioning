import { z } from "zod";

import { createSPSiteColumnActionModule } from "../fields/create-sp-site-column";
import { deleteSPFieldActionModule } from "../fields/delete-sp-field";
import { modifySPFieldActionModule } from "../fields/modify-sp-field";
import { createSPListActionModule } from "../lists/create-sp-list";
import { deleteSPListActionModule } from "../lists/delete-sp-list";
import { modifySPListActionModule } from "../lists/modify-sp-list";

const siteSubactionSchemas = [
  createSPListActionModule.schema,
  modifySPListActionModule.schema,
  deleteSPListActionModule.schema,
  createSPSiteColumnActionModule.schema,
  modifySPFieldActionModule.schemasByPlacement.siteSubaction,
  deleteSPFieldActionModule.schemasByPlacement.siteSubaction,
] as const;

export const siteSubactionSchema = z.discriminatedUnion("verb", siteSubactionSchemas);

