import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { listViewMutableStateSchema, listViewTitleSchema } from "../_shared/schema";

export const createSPListViewSchema = z.object({
  verb: z.literal("createSPListView"),
  title: listViewTitleSchema,
  ...listViewMutableStateSchema,
  subactions: leafSubactionsSchema,
}).strict();

export type CreateSPListViewPayload = z.infer<typeof createSPListViewSchema>;
