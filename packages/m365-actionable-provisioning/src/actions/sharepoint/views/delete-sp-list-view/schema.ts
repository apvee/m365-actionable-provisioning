import { z } from "zod";

import { listViewTitleSchema } from "../_shared/schema";

export const deleteSPListViewSchema = z.object({
  verb: z.literal("deleteSPListView"),
  title: listViewTitleSchema,
});

export type DeleteSPListViewPayload = z.infer<typeof deleteSPListViewSchema>;
