import { z } from "zod";

import {
  addSPFieldSchema_List,
} from "../fields/add-sp-field.schema";
import {
  modifySPFieldSchema_List,
} from "../fields/modify-sp-field.schema";
import {
  deleteSPFieldSchema_List,
} from "../fields/delete-sp-field.schema";

import { enableSPListRatingSchema } from "./enable-sp-list-rating.schema";

const listSubactionSchemas = [
  addSPFieldSchema_List,
  modifySPFieldSchema_List,
  deleteSPFieldSchema_List,
  enableSPListRatingSchema,
] as const;

export const listSubactionSchema = z.discriminatedUnion("verb", listSubactionSchemas);
