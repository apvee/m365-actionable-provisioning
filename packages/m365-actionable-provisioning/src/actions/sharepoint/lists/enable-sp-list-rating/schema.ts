import { z } from "zod";

import { leafSubactionsSchema } from "../../_shared/schemas/action-schemas";

export const enableSPListRatingSchema = z.object({
  verb: z.literal("enableSPListRating"),
  ratingType: z.enum(["Stars", "Likes"]),

  // No subactions allowed (leaf action)
  subactions: leafSubactionsSchema,
});

export type EnableSPListRatingPayload = z.infer<typeof enableSPListRatingSchema>;
