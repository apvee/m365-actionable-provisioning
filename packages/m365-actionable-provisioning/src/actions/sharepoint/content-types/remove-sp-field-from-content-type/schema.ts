import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { fieldReferenceSchema } from "../_shared/reference-schema";

export const removeSPFieldFromContentTypeSchema = fieldReferenceSchema.safeExtend({
  verb: z.literal("removeSPFieldFromContentType"),
  subactions: leafSubactionsSchema,
});

export type RemoveSPFieldFromContentTypePayload = z.infer<typeof removeSPFieldFromContentTypeSchema>;
