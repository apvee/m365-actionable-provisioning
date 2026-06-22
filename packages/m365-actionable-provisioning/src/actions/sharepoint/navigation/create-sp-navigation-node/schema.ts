import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import {
  spNavigationLocationSchema,
  spNavigationNodeTitleSchema,
  spNavigationNodeUrlSchema,
} from "../_shared/schema";

export const createSPNavigationNodeSchema = z.object({
  verb: z.literal("createSPNavigationNode"),
  location: spNavigationLocationSchema,
  title: spNavigationNodeTitleSchema,
  url: spNavigationNodeUrlSchema,
  isVisible: z.boolean().optional(),
  subactions: leafSubactionsSchema,
}).strict();

export type CreateSPNavigationNodePayload = z.infer<typeof createSPNavigationNodeSchema>;
