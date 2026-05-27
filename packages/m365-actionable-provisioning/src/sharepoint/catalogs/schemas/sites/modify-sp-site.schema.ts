import { z } from "zod";

import { siteSubactionSchema } from "./site-subactions.schemas";

const webUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .strict();

export const modifySPSiteSchema = z.object({
  verb: z.literal("modifySPSite"),

  // Optional: if omitted, the action targets the site in the current SPFI context
  // (or any parent-provided scope web/site handle).
  siteUrl: z.string().url().optional(),

  // Web properties are intentionally lifted to root-level for plan ergonomics.
  ...webUpdateSchema.shape,

  subactions: z.array(siteSubactionSchema).optional(),
});

export type ModifySPSitePayload = z.infer<typeof modifySPSiteSchema>;
