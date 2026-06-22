import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { compareProperties } from "../../_shared/compliance-compare";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import {
  getGraphContentTypeComplianceReason,
  getContentTypeReferenceResource,
  graphContentTypePermissionCheck,
  normalizeGraphContentTypeError,
  resolveGraphSiteTarget,
  resolveSiteContentType,
} from "../../domains/content-types";

import { modifySPContentTypeSchema, type ModifySPContentTypePayload } from "./schema";

export class ModifySPContentTypeAction extends ActionDefinition<
  "modifySPContentType",
  typeof modifySPContentTypeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "modifySPContentType";
  readonly actionSchema = modifySPContentTypeSchema;
  readonly requiredClients = ["graphClient"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return graphContentTypePermissionCheck();
  }

  async handler(ctx: M365RuntimeContext<ModifySPContentTypePayload>): Promise<M365ActionResult> {
    const graphClient = ctx.clients.graphClient;
    if (!graphClient) throw new Error("GraphFI instance not available in scope");

    const payload = ctx.action.payload;
    try {
      const target = await resolveGraphSiteTarget(graphClient, ctx.scopeIn, payload);
      const resolved = await resolveSiteContentType(graphClient, target.graphSiteId, payload);
      if (!resolved) return actionSkipped(getContentTypeReferenceResource(payload), "not_found");

      const patch = {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.group !== undefined ? { group: payload.group } : {}),
      };
      if (Object.keys(patch).length === 0) {
        return actionSkipped(getContentTypeReferenceResource(payload), "no_changes", {
          contentType: resolved.handle,
          contentTypeId: resolved.info.id,
          contentTypeName: resolved.info.name,
          graphSiteId: target.graphSiteId,
        }, resolved.warnings);
      }

      await resolved.handle.update(patch);
      return actionExecuted(payload.name ?? payload.contentTypeName ?? payload.contentTypeId ?? "(content type)", {
        contentType: resolved.handle,
        contentTypeId: resolved.info.id,
        contentTypeName: payload.name ?? resolved.info.name,
        graphSiteId: target.graphSiteId,
      }, resolved.warnings);
    } catch (error) {
      const normalized = normalizeGraphContentTypeError(error, "modifySPContentType");
      throw new Error(normalized.message);
    }
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, ModifySPContentTypePayload, M365Clients>
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
      if (!resolved) return nonCompliant({ resource, reason: "not_found" });

      const expected = {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
        ...(payload.group !== undefined ? { group: payload.group } : {}),
      };
      if (Object.keys(expected).length === 0) {
        return compliant({ resource, reason: "no_changes", scopeDelta: { contentType: resolved.handle, contentTypeId: resolved.info.id, contentTypeName: resolved.info.name, graphSiteId: target.graphSiteId } });
      }

      const mismatches = compareProperties(expected, resolved.info as Record<string, unknown>, { nullishEqual: true });
      if (mismatches.length > 0) {
        return nonCompliant({ resource, reason: "mismatch", details: { mismatches } });
      }

      return compliant({
        resource,
        scopeDelta: {
          contentType: resolved.handle,
          contentTypeId: resolved.info.id,
          contentTypeName: payload.name ?? resolved.info.name,
          graphSiteId: target.graphSiteId,
        },
      });
    } catch (error) {
      const graphError = getGraphContentTypeComplianceReason(error, "modifySPContentType compliance");
      if (graphError.reason !== "graph_error") {
        return unverifiable({ resource, reason: graphError.reason, message: graphError.message });
      }
      return unverifiableError(resource, error);
    }
  }
}
