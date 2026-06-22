import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { listViewTitleSchema } from "../_shared/schema";

export const deleteSPListViewSchema = z.object({
  verb: z.literal("deleteSPListView"),
  title: listViewTitleSchema,
  subactions: leafSubactionsSchema,
}).strict();

export type DeleteSPListViewPayload = z.infer<typeof deleteSPListViewSchema>;
