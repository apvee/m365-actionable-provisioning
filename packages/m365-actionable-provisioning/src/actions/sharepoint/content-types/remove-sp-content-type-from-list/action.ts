import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import {
  getGraphContentTypeComplianceReason,
  getContentTypeReferenceResource,
  graphContentTypePermissionCheck,
  normalizeGraphContentTypeError,
  resolveGraphListTarget,
  resolveListContentType,
} from "../../domains/content-types";

import { removeSPContentTypeFromListSchema, type RemoveSPContentTypeFromListPayload } from "./schema";

export class RemoveSPContentTypeFromListAction extends ActionDefinition<
  "removeSPContentTypeFromList",
  typeof removeSPContentTypeFromListSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "removeSPContentTypeFromList";
  readonly actionSchema = removeSPContentTypeFromListSchema;
  readonly requiredClients = ["graphClient"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return graphContentTypePermissionCheck();
  }

  async handler(ctx: M365RuntimeContext<RemoveSPContentTypeFromListPayload>): Promise<M365ActionResult> {
    const graphClient = ctx.clients.graphClient;
    if (!graphClient) throw new Error("GraphFI instance not available in scope");

    const payload = ctx.action.payload;
    const resource = getContentTypeReferenceResource(payload);
    try {
      const target = await resolveGraphListTarget(graphClient, ctx.scopeIn, payload);
      const existing = await resolveListContentType(graphClient, target.graphSiteId, target.graphListId, payload);
      if (!existing) return actionSkipped(resource, "not_found");

      await existing.handle.delete();
      return actionExecuted(resource, undefined, existing.warnings);
    } catch (error) {
      const normalized = normalizeGraphContentTypeError(error, "removeSPContentTypeFromList");
      throw new Error(`removeSPContentTypeFromList failed for ${resource}. The content type may be default or in use. ${normalized.message}`);
    }
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, RemoveSPContentTypeFromListPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const graphClient = ctx.clients.graphClient;
    const payload = ctx.action.payload;
    const resource = getContentTypeReferenceResource(payload);
    if (!graphClient) {
      return unverifiable({ resource, reason: "missing_prerequisite", message: "GraphFI instance not available in scope" });
    }

    try {
      const target = await resolveGraphListTarget(graphClient, ctx.scopeIn, payload);
      const existing = await resolveListContentType(graphClient, target.graphSiteId, target.graphListId, payload);
      return existing ? nonCompliant({ resource, reason: "still_present" }) : compliant({ resource });
    } catch (error) {
      const graphError = getGraphContentTypeComplianceReason(error, "removeSPContentTypeFromList compliance");
      if (graphError.reason !== "graph_error") {
        return unverifiable({ resource, reason: graphError.reason, message: graphError.message });
      }
      return unverifiableError(resource, error);
    }
  }
}
