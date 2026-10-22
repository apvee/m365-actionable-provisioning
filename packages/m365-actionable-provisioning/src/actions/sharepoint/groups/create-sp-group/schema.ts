import { z } from "zod";
import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";
import { spGroupNameSchema } from "../_shared/schema";

/** Ensures a SharePoint group exists; properties apply only during creation. */
export const createSPGroupSchema = z.object({
  verb: z.literal("createSPGroup"),
  title: spGroupNameSchema,
  description: z.string().optional(),
  subactions: leafSubactionsSchema,
}).strict();

export type CreateSPGroupPayload = z.infer<typeof createSPGroupSchema>;
