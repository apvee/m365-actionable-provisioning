import { z } from "zod";
import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";

export const deleteSPSiteSchema = z.object({
  verb: z.literal("deleteSPSite"),
  siteUrl: z.string().url(),
  subactions: leafSubactionsSchema,
});

export type DeleteSPSitePayload = z.infer<typeof deleteSPSiteSchema>;
