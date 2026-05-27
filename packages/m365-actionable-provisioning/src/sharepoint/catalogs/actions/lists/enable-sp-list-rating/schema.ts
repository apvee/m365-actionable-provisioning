import { z } from "zod";

export const enableSPListRatingSchema = z.object({
  verb: z.literal("enableSPListRating"),
  ratingType: z.enum(["Stars", "Likes"]),

  // No subactions allowed (leaf action)
  subactions: z.array(z.never()).optional(),
});

export type EnableSPListRatingPayload = z.infer<typeof enableSPListRatingSchema>;
