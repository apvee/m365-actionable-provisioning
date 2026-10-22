import { z } from "zod";

export const spGroupNameSchema = z.string().trim().min(1);

export const spGroupReferenceFields = {
  groupId: z.number().int().positive().optional(),
  groupName: spGroupNameSchema.optional(),
};

export function validateSPGroupReference(
  value: { groupId?: number; groupName?: string },
  ctx: z.RefinementCtx
): void {
  if ((value.groupId !== undefined) === (value.groupName !== undefined)) {
    ctx.addIssue({
      code: "custom",
      message: "Exactly one of groupId or groupName must be provided",
      path: ["groupId"],
    });
  }
}
