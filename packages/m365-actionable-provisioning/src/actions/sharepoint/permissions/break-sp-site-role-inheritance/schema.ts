import { z } from "zod";

import { createBreakRoleInheritanceSchema } from "../../domains/permissions/schema";

export const breakSPSiteRoleInheritanceSchema = createBreakRoleInheritanceSchema("breakSPSiteRoleInheritance");

export type BreakSPSiteRoleInheritancePayload = z.infer<typeof breakSPSiteRoleInheritanceSchema>;
