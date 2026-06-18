import { z } from "zod";

import { createGrantRoleAssignmentSchema } from "../../domains/permissions/schema";

export const grantSPSiteRoleAssignmentSchema = createGrantRoleAssignmentSchema("grantSPSiteRoleAssignment");

export type GrantSPSiteRoleAssignmentPayload = z.infer<typeof grantSPSiteRoleAssignmentSchema>;
