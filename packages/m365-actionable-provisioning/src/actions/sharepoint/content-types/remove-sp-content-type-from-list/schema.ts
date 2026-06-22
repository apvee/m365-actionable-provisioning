import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { contentTypeReferenceSchema } from "../_shared/reference-schema";

export const removeSPContentTypeFromListSchema = contentTypeReferenceSchema.safeExtend({
  verb: z.literal("removeSPContentTypeFromList"),
  subactions: leafSubactionsSchema,
});

export type RemoveSPContentTypeFromListPayload = z.infer<typeof removeSPContentTypeFromListSchema>;
