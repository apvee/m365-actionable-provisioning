import type { ContentType as GraphContentType } from "@microsoft/microsoft-graph-types";
import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight, ProvisioningWarning } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import { getGraphContentTypeComplianceReason, graphContentTypePermissionCheck, normalizeGraphContentTypeError, resolveGraphSiteTarget, resolveSiteContentType } from "../../domains/content-types";

import { createSPContentTypeSchema, type CreateSPContentTypePayload } from "./schema";

import "@pnp/graph/sites";
import "@pnp/graph/content-types";

function getParentId(info: GraphContentType): string | undefined {
  return info.base?.id;
}

export class CreateSPContentTypeAction extends ActionDefinition<
  "createSPContentType",
  typeof createSPContentTypeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "createSPContentType";
  readonly actionSchema = createSPContentTypeSchema;
  readonly requiredClients = ["graphClient"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return graphContentTypePermissionCheck();
  }

  async handler(ctx: M365RuntimeContext<CreateSPContentTypePayload>): Promise<M365ActionResult> {
    const graphClient = ctx.clients.graphClient;
    if (!graphClient) throw new Error("GraphFI instance not available in scope");

    const payload = ctx.action.payload;
    try {
      const target = await resolveGraphSiteTarget(graphClient, ctx.scopeIn, payload);
      const existing = await resolveSiteContentType(graphClient, target.graphSiteId, { contentTypeName: payload.name });
      if (existing) {
        const warnings: ProvisioningWarning[] = [...existing.warnings];
        const actualParentId = getParentId(existing.info);
        if (actualParentId && actualParentId !== payload.parentId) {
          warnings.push({
            code: "CONTENT_TYPE_PARENT_MISMATCH",
            message: "Content type already exists, but its parent/base content type does not match the create action payload.",
            details: {
              contentTypeName: payload.name,
              expectedParentId: payload.parentId,
              actualParentId,
            },
          });
        }

        return actionSkipped(payload.name, "already_exists", {
          contentType: existing.handle,
          contentTypeId: existing.info.id,
          contentTypeName: existing.info.name ?? payload.name,
          graphSiteId: target.graphSiteId,
        }, warnings);
      }

      const created = await graphClient.sites.getById(target.graphSiteId).contentTypes.add({
        name: payload.name,
        description: payload.description,
        group: payload.group,
        base: { id: payload.parentId },
      });

      return actionExecuted(payload.name, {
        contentType: created.contentType,
        contentTypeId: created.data.id,
        contentTypeName: created.data.name ?? payload.name,
        graphSiteId: target.graphSiteId,
      });
    } catch (error) {
      const normalized = normalizeGraphContentTypeError(error, "createSPContentType");
      throw new Error(normalized.message);
    }
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPContentTypePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const graphClient = ctx.clients.graphClient;
    if (!graphClient) {
      return unverifiable({ resource: ctx.action.payload.name, reason: "missing_prerequisite", message: "GraphFI instance not available in scope" });
    }

    const payload = ctx.action.payload;
    try {
      const target = await resolveGraphSiteTarget(graphClient, ctx.scopeIn, payload);
      const resolved = await resolveSiteContentType(graphClient, target.graphSiteId, { contentTypeName: payload.name });
      if (!resolved) return nonCompliant({ resource: payload.name, reason: "not_found" });

      const actualParentId = getParentId(resolved.info);
      if (actualParentId && actualParentId !== payload.parentId) {
        return nonCompliant({
          resource: payload.name,
          reason: "parent_mismatch",
          details: { expectedParentId: payload.parentId, actualParentId },
        });
      }

      return compliant({
        resource: payload.name,
        scopeDelta: {
          contentType: resolved.handle,
          contentTypeId: resolved.info.id,
          contentTypeName: resolved.info.name ?? payload.name,
          graphSiteId: target.graphSiteId,
        },
      });
    } catch (error) {
      const graphError = getGraphContentTypeComplianceReason(error, "createSPContentType compliance");
      if (graphError.reason !== "graph_error") {
        return unverifiable({ resource: payload.name, reason: graphError.reason, message: graphError.message });
      }
      return unverifiableError(payload.name, error);
    }
  }
}
