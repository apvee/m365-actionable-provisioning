import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { contentTypeReferenceSchema, graphTargetSchema } from "../_shared/reference-schema";

export const deleteSPContentTypeSchema = graphTargetSchema
  .merge(contentTypeReferenceSchema)
  .extend({
    verb: z.literal("deleteSPContentType"),
    subactions: leafSubactionsSchema,
  });

export type DeleteSPContentTypePayload = z.infer<typeof deleteSPContentTypeSchema>;
