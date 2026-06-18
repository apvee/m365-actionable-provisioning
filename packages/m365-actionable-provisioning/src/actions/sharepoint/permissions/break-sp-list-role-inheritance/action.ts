import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionSkipped, unverifiable } from "../../_shared/action-results";

import { breakSPListRoleInheritanceSchema, type BreakSPListRoleInheritancePayload } from "./schema";

export class BreakSPListRoleInheritanceAction extends ActionDefinition<
  "breakSPListRoleInheritance",
  typeof breakSPListRoleInheritanceSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "breakSPListRoleInheritance";
  readonly actionSchema = breakSPListRoleInheritanceSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return { decision: "unknown", message: "SharePoint permission runtime is introduced in Task 4" };
  }

  async handler(ctx: M365RuntimeContext<BreakSPListRoleInheritancePayload>): Promise<M365ActionResult> {
    return actionSkipped(ctx.action.verb, "unsupported");
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, BreakSPListRoleInheritancePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    return unverifiable({
      resource: ctx.action.verb,
      reason: "not_supported",
      message: "SharePoint permission runtime is introduced in Task 4",
    });
  }
}
