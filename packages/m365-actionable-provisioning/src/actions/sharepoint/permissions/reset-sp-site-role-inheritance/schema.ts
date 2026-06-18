import { z } from "zod";

import { createResetRoleInheritanceSchema } from "../../domains/permissions/schema";

export const resetSPSiteRoleInheritanceSchema = createResetRoleInheritanceSchema("resetSPSiteRoleInheritance");

export type ResetSPSiteRoleInheritancePayload = z.infer<typeof resetSPSiteRoleInheritanceSchema>;
