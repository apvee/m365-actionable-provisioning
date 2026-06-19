import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { spNavigationLocationSchema, spNavigationNodeTitleSchema } from "../_shared/schema";

export const deleteSPNavigationNodeSchema = z.object({
  verb: z.literal("deleteSPNavigationNode"),
  location: spNavigationLocationSchema,
  title: spNavigationNodeTitleSchema,
  subactions: leafSubactionsSchema,
}).strict();

export type DeleteSPNavigationNodePayload = z.infer<typeof deleteSPNavigationNodeSchema>;
