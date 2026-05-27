import { z } from "zod";

import { draftVersionVisibilitySchema, listNameSchema } from "./base.schemas";
import { listSubactionSchema } from "./list-subactions.schemas";

export const modifySPListSchema = z.object({
  verb: z.literal("modifySPList"),
  webUrl: z.string().url().optional(),
  listName: listNameSchema,

  hidden: z.boolean().optional(),
  onQuickLaunch: z.boolean().optional(),
  description: z.string().optional(),
  title: z.string().optional(),
  enableAttachments: z.boolean().optional(),
  enableModeration: z.boolean().optional(),
  enableVersioning: z.boolean().optional(),
  enableMinorVersions: z.boolean().optional(),
  majorVersionLimit: z.number().int().min(1).max(50000).optional(),
  majorWithMinorVersionsLimit: z.number().int().min(1).max(50000).optional(),
  draftVersionVisibility: draftVersionVisibilitySchema.optional(),
  enableFolderCreation: z.boolean().optional(),
  irmEnabled: z.boolean().optional(),
  irmExpire: z.boolean().optional(),
  irmReject: z.boolean().optional(),

  subactions: z.array(listSubactionSchema).optional(),
});

export type ModifySPListPayload = z.infer<typeof modifySPListSchema>;
