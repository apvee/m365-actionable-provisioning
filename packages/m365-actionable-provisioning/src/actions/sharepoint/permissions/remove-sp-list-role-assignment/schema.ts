import { z } from "zod";

import { createRemoveRoleAssignmentSchema } from "../../domains/permissions/schema";

export const removeSPListRoleAssignmentSchema = createRemoveRoleAssignmentSchema("removeSPListRoleAssignment");

export type RemoveSPListRoleAssignmentPayload = z.infer<typeof removeSPListRoleAssignmentSchema>;
