import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { contentTypeReferenceSchema, graphTargetSchema } from "../_shared/reference-schema";

export const modifySPContentTypeSchema = graphTargetSchema
  .merge(contentTypeReferenceSchema)
  .extend({
    verb: z.literal("modifySPContentType"),
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    group: z.string().optional(),
    subactions: leafSubactionsSchema,
  });

export type ModifySPContentTypePayload = z.infer<typeof modifySPContentTypeSchema>;
