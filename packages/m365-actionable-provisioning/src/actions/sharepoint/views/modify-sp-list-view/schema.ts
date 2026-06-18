import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { listViewMutableStateSchema, listViewTitleSchema } from "../_shared/schema";

export const modifySPListViewSchema = z.object({
  verb: z.literal("modifySPListView"),
  title: listViewTitleSchema,
  ...listViewMutableStateSchema,
  subactions: leafSubactionsSchema,
}).strict();

export type ModifySPListViewPayload = z.infer<typeof modifySPListViewSchema>;
