import { z } from "zod";

import { listViewMutableStateSchema, listViewTitleSchema } from "../_shared/schema";

export const modifySPListViewSchema = z.object({
  verb: z.literal("modifySPListView"),
  title: listViewTitleSchema,
  newTitle: listViewTitleSchema.optional(),
  ...listViewMutableStateSchema,
});

export type ModifySPListViewPayload = z.infer<typeof modifySPListViewSchema>;
