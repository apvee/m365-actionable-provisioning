import { z } from "zod";

import { listNameSchema } from "./base.schemas";

export const deleteSPListSchema = z.object({
  verb: z.literal("deleteSPList"),
  webUrl: z.string().url().optional(),
  listName: listNameSchema,
  recycle: z.boolean().default(true),
  subactions: z.array(z.never()).optional(),
});

export type DeleteSPListPayload = z.infer<typeof deleteSPListSchema>;
