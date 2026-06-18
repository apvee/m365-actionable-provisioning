import { z } from "zod";

import { createResetRoleInheritanceSchema } from "../../domains/permissions/schema";

export const resetSPListRoleInheritanceSchema = createResetRoleInheritanceSchema("resetSPListRoleInheritance");

export type ResetSPListRoleInheritancePayload = z.infer<typeof resetSPListRoleInheritanceSchema>;
