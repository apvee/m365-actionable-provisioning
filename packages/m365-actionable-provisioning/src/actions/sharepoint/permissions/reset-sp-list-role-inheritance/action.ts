import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionSkipped, unverifiable } from "../../_shared/action-results";

import { resetSPListRoleInheritanceSchema, type ResetSPListRoleInheritancePayload } from "./schema";

export class ResetSPListRoleInheritanceAction extends ActionDefinition<
  "resetSPListRoleInheritance",
  typeof resetSPListRoleInheritanceSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "resetSPListRoleInheritance";
  readonly actionSchema = resetSPListRoleInheritanceSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return { decision: "unknown", message: "SharePoint permission runtime is introduced in Task 4" };
  }

  async handler(ctx: M365RuntimeContext<ResetSPListRoleInheritancePayload>): Promise<M365ActionResult> {
    return actionSkipped(ctx.action.verb, "unsupported");
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, ResetSPListRoleInheritancePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    return unverifiable({
      resource: ctx.action.verb,
      reason: "not_supported",
      message: "SharePoint permission runtime is introduced in Task 4",
    });
  }
}
