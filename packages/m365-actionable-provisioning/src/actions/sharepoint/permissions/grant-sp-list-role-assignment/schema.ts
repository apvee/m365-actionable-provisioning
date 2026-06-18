import { z } from "zod";

import { createGrantRoleAssignmentSchema } from "../../domains/permissions/schema";

export const grantSPListRoleAssignmentSchema = createGrantRoleAssignmentSchema("grantSPListRoleAssignment");

export type GrantSPListRoleAssignmentPayload = z.infer<typeof grantSPListRoleAssignmentSchema>;
