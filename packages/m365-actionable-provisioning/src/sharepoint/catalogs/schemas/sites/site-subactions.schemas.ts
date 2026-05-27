import { z } from "zod";

import { createSPListSchema } from "../lists/create-sp-list.schema";
import { modifySPListSchema } from "../lists/modify-sp-list.schema";
import { deleteSPListSchema } from "../lists/delete-sp-list.schema";
import {
  createSPSiteColumnSchema_Site,
} from "../fields/create-sp-site-column.schema";
import {
  modifySPFieldSchema_Site,
} from "../fields/modify-sp-field.schema";
import {
  deleteSPFieldSchema_Site,
} from "../fields/delete-sp-field.schema";

const siteListActionSchemas = [createSPListSchema, modifySPListSchema, deleteSPListSchema] as const;

const siteSubactionSchemas = [
  ...siteListActionSchemas,
  createSPSiteColumnSchema_Site,
  modifySPFieldSchema_Site,
  deleteSPFieldSchema_Site,
] as const;

export const siteSubactionSchema = z.discriminatedUnion("verb", siteSubactionSchemas);
