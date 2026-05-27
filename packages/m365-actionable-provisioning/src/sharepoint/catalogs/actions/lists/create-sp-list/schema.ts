/**
 * CreateSPList action schema.
 * 
 * @packageDocumentation
 */

import { z } from "zod";

import {
  displayNameSchema,
  listNameSchema,
  DraftVersionVisibility,
  draftVersionVisibilitySchema,
} from "./base.schemas";

import { listSubactionSchema } from "./list-subactions.schemas";

// Numeric list template type. PnPjs and REST treat this as a number (BaseTemplate).
const templateTypeSchema = z
  .number()
  .int("Template type must be an integer")
  .positive("Template type must be positive")
  .default(100);

export { DraftVersionVisibility };

export const createSPListSchema = z.object({
  verb: z.literal("createSPList"),
  siteUrl: z.string().url().optional(),
  webUrl: z.string().url().optional(),
  listName: listNameSchema,
  title: displayNameSchema,
  desc: z.string().optional(),
  template: templateTypeSchema,

  enableContentTypes: z.boolean().optional(),
  hidden: z.boolean().optional(),
  onQuickLaunch: z.boolean().optional(),
  enableAttachments: z.boolean().optional(),
  enableFolderCreation: z.boolean().optional(),
  enableVersioning: z.boolean().optional(),
  enableMinorVersions: z.boolean().optional(),
  forceCheckout: z.boolean().optional(),
  majorVersionLimit: z.number().int().min(1).max(50000).optional(),
  majorWithMinorVersionsLimit: z.number().int().min(1).max(50000).optional(),
  draftVersionVisibility: draftVersionVisibilitySchema.optional(),
  readSecurity: z.number().int().min(1).max(2).optional(),
  writeSecurity: z.number().int().min(1).max(4).optional(),
  noCrawl: z.boolean().optional(),
  enableModeration: z.boolean().optional(),

  subactions: z.array(listSubactionSchema).optional(),
});

export type CreateSPListPayload = z.infer<typeof createSPListSchema>;
