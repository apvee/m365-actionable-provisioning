import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import {
  spNavigationLocationSchema,
  spNavigationNodeMutableStateSchema,
  spNavigationNodeTitleSchema,
} from "../_shared/schema";

export const modifySPNavigationNodeSchema = z.object({
  verb: z.literal("modifySPNavigationNode"),
  location: spNavigationLocationSchema,
  title: spNavigationNodeTitleSchema,
  newTitle: spNavigationNodeTitleSchema.optional(),
  ...spNavigationNodeMutableStateSchema,
  subactions: leafSubactionsSchema,
}).strict();

export type ModifySPNavigationNodePayload = z.infer<typeof modifySPNavigationNodeSchema>;
