import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import { getNavigationCollection, getNavigationNodeInfoByTitle, getNavigationNodeMismatches } from "../../domains/navigation";
import { buildAmbiguousNavigationNodeWarning, buildNavigationScopeDelta, checkNavigationManageWebPermission, getNavigationCompliancePrerequisites } from "../_shared/scope";
import { createSPNavigationNodeSchema, type CreateSPNavigationNodePayload } from "./schema";
import "@pnp/sp/navigation";

export class CreateSPNavigationNodeAction extends ActionDefinition<
  "createSPNavigationNode",
  typeof createSPNavigationNodeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "createSPNavigationNode";
  readonly actionSchema = createSPNavigationNodeSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<CreateSPNavigationNodePayload>): Promise<PermissionCheckResult> {
    return checkNavigationManageWebPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<CreateSPNavigationNodePayload>): Promise<M365ActionResult> {
    const web = ctx.scopeIn.web;
    const payload = ctx.action.payload;
    if (!web) return actionSkipped(payload.title, "missing_prerequisite");

    const existing = await getNavigationNodeInfoByTitle(web, payload.location, payload.title);
    if (existing.kind === "found") return actionSkipped(payload.title, "already_exists", buildNavigationScopeDelta(ctx.scopeIn));
    if (existing.kind === "ambiguous") {
      return actionSkipped(
        payload.title,
        "unsupported",
        buildNavigationScopeDelta(ctx.scopeIn),
        [buildAmbiguousNavigationNodeWarning(payload.location, payload.title, existing.matches.length)]
      );
    }

    await getNavigationCollection(web, payload.location).add(payload.title, payload.url, payload.isVisible ?? true);
    return actionExecuted(payload.title, buildNavigationScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPNavigationNodePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const payload = ctx.action.payload;
    const prerequisites = getNavigationCompliancePrerequisites(ctx, payload.title);
    if (prerequisites.ok === false) return prerequisites.result;

    try {
      const existing = await getNavigationNodeInfoByTitle(prerequisites.web, payload.location, payload.title);
      if (existing.kind === "missing") return nonCompliant({ resource: payload.title, reason: "not_found" });
      if (existing.kind === "ambiguous") return nonCompliant({ resource: payload.title, reason: "ambiguous" });

      const mismatches = getNavigationNodeMismatches(
        { url: payload.url, isVisible: payload.isVisible },
        existing.node,
        { webUrl: ctx.scopeIn.webUrl }
      );

      return mismatches.length === 0
        ? compliant({ resource: payload.title, scopeDelta: buildNavigationScopeDelta(ctx.scopeIn) })
        : nonCompliant({ resource: payload.title, reason: "drift", details: { mismatches } });
    } catch (error) {
      return unverifiableError(payload.title, error);
    }
  }
}
