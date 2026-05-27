import { z } from "zod";

export const deleteSPSiteSchema = z.object({
  verb: z.literal("deleteSPSite"),
  siteUrl: z.string().url(),
});

export type DeleteSPSitePayload = z.infer<typeof deleteSPSiteSchema>;
