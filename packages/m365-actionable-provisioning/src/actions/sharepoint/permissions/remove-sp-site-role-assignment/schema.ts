import { z } from "zod";

import { createRemoveRoleAssignmentSchema } from "../../domains/permissions/schema";

export const removeSPSiteRoleAssignmentSchema = createRemoveRoleAssignmentSchema("removeSPSiteRoleAssignment");

export type RemoveSPSiteRoleAssignmentPayload = z.infer<typeof removeSPSiteRoleAssignmentSchema>;
