import { z } from "zod";

import { subactionsOf } from "../../_shared/schemas/action-schemas";
import { contentTypeSubactionSchema } from "../../_composition/content-type-subactions-schema";
import { graphTargetSchema } from "../_shared/reference-schema";

export const createSPContentTypeSchema = graphTargetSchema.extend({
  verb: z.literal("createSPContentType"),
  name: z.string().min(1),
  parentId: z.string().min(1),
  description: z.string().optional(),
  group: z.string().optional(),
  subactions: subactionsOf(contentTypeSubactionSchema),
});

export type CreateSPContentTypePayload = z.infer<typeof createSPContentTypeSchema>;
