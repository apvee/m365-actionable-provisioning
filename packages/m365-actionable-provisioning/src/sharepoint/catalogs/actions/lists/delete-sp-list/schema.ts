import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { listNameSchema } from "../_shared/base-schemas";

export const deleteSPListSchema = z.object({
  verb: z.literal("deleteSPList"),
  webUrl: z.string().url().optional(),
  listName: listNameSchema,
  recycle: z.boolean().default(true),
  subactions: leafSubactionsSchema,
});

export type DeleteSPListPayload = z.infer<typeof deleteSPListSchema>;
