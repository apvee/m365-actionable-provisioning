import { z } from "zod";

import { listViewMutableStateSchema, listViewTitleSchema } from "../_shared/schema";

export const createSPListViewSchema = z.object({
  verb: z.literal("createSPListView"),
  title: listViewTitleSchema,
  ...listViewMutableStateSchema,
});

export type CreateSPListViewPayload = z.infer<typeof createSPListViewSchema>;
