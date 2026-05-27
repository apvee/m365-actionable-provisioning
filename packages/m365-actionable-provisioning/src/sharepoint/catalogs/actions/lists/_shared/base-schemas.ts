import { z } from "zod";

import { nonEmptyStringSchema } from "../shared/strings.schemas";

export const displayNameSchema = z
  .string()
  .min(1, "Display name cannot be empty")
  .max(255, "Display name cannot exceed 255 characters");

// URL-friendly list name (used as RootFolder/Name)
export const listNameSchema = z
  .string()
  .min(1, "List name cannot be empty")
  .max(100, "List name cannot exceed 100 characters")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_-]*$/,
    "List name must start with a letter and contain only letters, numbers, hyphens, and underscores (no spaces)"
  );

// Keep for future reuse; avoids ad-hoc `.min(1)` scattered in list schemas.
export const descriptionSchema = nonEmptyStringSchema;

// Draft version visibility options in SharePoint
export enum DraftVersionVisibility {
  Reader = 0,
  Author = 1,
  Approver = 2,
}

export const draftVersionVisibilitySchema = z.nativeEnum(DraftVersionVisibility, {
  message: "Draft version visibility must be Reader (0), Author (1), or Approver (2)",
});
