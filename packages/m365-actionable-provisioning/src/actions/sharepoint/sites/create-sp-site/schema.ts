import { z } from "zod";

import { subactionsOf } from "../../_shared/schemas/action-schemas";
import { siteSubactionSchema } from "../../_composition/site-subactions-schema";

/* ========================================
   SCHEMA
   ======================================== */

const communicationSiteSchema = z.object({
  verb: z.literal("createSPSite"),
  siteType: z.literal("CommunicationSite"),

  // Required
  title: z.string().min(1),
  url: z.url(),

  // Optional
  owner: z.string().email().optional(),
  lcid: z.number().int().positive().optional(),
  description: z.string().optional(),
  classification: z.string().optional(),
  siteDesignId: z.string().uuid().optional(),
  hubSiteId: z.string().uuid().optional(),
  shareByEmailEnabled: z.boolean().optional(),
  webTemplate: z.enum(["SITEPAGEPUBLISHING#0", "STS#3"]).optional(),

  subactions: subactionsOf(siteSubactionSchema),
});

const teamSiteSchema = z.object({
  verb: z.literal("createSPSite"),
  siteType: z.literal("TeamSite"),

  // Required
  displayName: z.string().min(1),
  alias: z.string().min(1),
  url: z.string().url(),

  // Optional
  isPublic: z.boolean().optional(),
  lcid: z.number().int().positive().optional(),
  description: z.string().optional(),
  classification: z.string().optional(),
  owners: z.array(z.string().email()).optional(),
  hubSiteId: z.string().uuid().optional(),
  siteDesignId: z.string().uuid().optional(),

  subactions: subactionsOf(siteSubactionSchema),
});

export const createSPSiteSchema = z.discriminatedUnion("siteType", [
  communicationSiteSchema,
  teamSiteSchema,
]);

export type CreateSPSitePayload = z.infer<typeof createSPSiteSchema>;
