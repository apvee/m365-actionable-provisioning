import { z } from "zod";

export const spNavigationLocationSchema = z.enum(["quicklaunch", "topNavigationBar"]);
export type SPNavigationLocation = z.infer<typeof spNavigationLocationSchema>;

export const spNavigationNodeTitleSchema = z
  .string()
  .trim()
  .min(1, "Navigation node title cannot be empty")
  .max(255, "Navigation node title cannot exceed 255 characters");

export const spNavigationNodeUrlSchema = z
  .string()
  .trim()
  .min(1, "Navigation node URL cannot be empty")
  .max(2048, "Navigation node URL cannot exceed 2048 characters");

export const spNavigationNodeMutableStateSchema = {
  url: spNavigationNodeUrlSchema.optional(),
  isVisible: z.boolean().optional(),
} as const;
