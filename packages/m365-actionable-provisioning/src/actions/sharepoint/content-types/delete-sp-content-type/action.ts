import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import {
  getGraphContentTypeComplianceReason,
  getContentTypeReferenceResource,
  graphContentTypePermissionCheck,
  normalizeGraphContentTypeError,
  resolveGraphSiteTarget,
  resolveSiteContentType,
} from "../../domains/content-types";

import { deleteSPContentTypeSchema, type DeleteSPContentTypePayload } from "./schema";

export class DeleteSPContentTypeAction extends ActionDefinition<
  "deleteSPContentType",
  typeof deleteSPContentTypeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "deleteSPContentType";
  readonly actionSchema = deleteSPContentTypeSchema;
  readonly requiredClients = ["graphClient"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return graphContentTypePermissionCheck();
  }

  async handler(ctx: M365RuntimeContext<DeleteSPContentTypePayload>): Promise<M365ActionResult> {
    const graphClient = ctx.clients.graphClient;
    if (!graphClient) throw new Error("GraphFI instance not available in scope");

    const payload = ctx.action.payload;
    const resource = getContentTypeReferenceResource(payload);
    try {
      const target = await resolveGraphSiteTarget(graphClient, ctx.scopeIn, payload);
      const resolved = await resolveSiteContentType(graphClient, target.graphSiteId, payload);
      if (!resolved) return actionSkipped(resource, "not_found");

      await resolved.handle.delete();
      return actionExecuted(resource, undefined, resolved.warnings);
    } catch (error) {
      const normalized = normalizeGraphContentTypeError(error, "deleteSPContentType");
      throw new Error(`deleteSPContentType failed for ${resource}: ${normalized.message}`);
    }
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, DeleteSPContentTypePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const graphClient = ctx.clients.graphClient;
    const payload = ctx.action.payload;
    const resource = getContentTypeReferenceResource(payload);
    if (!graphClient) {
      return unverifiable({ resource, reason: "missing_prerequisite", message: "GraphFI instance not available in scope" });
    }

    try {
      const target = await resolveGraphSiteTarget(graphClient, ctx.scopeIn, payload);
      const resolved = await resolveSiteContentType(graphClient, target.graphSiteId, payload);
      return resolved ? nonCompliant({ resource, reason: "still_exists" }) : compliant({ resource });
    } catch (error) {
      const graphError = getGraphContentTypeComplianceReason(error, "deleteSPContentType compliance");
      if (graphError.reason !== "graph_error") {
        return unverifiable({ resource, reason: graphError.reason, message: graphError.message });
      }
      return unverifiableError(resource, error);
    }
  }
}
