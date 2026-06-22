import { z } from "zod";

import { createBreakRoleInheritanceSchema } from "../../domains/permissions/schema";

export const breakSPListRoleInheritanceSchema = createBreakRoleInheritanceSchema("breakSPListRoleInheritance");

export type BreakSPListRoleInheritancePayload = z.infer<typeof breakSPListRoleInheritanceSchema>;
