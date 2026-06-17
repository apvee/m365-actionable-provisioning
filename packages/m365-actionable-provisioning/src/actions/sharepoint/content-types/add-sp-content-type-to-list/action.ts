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
  resolveSiteContentType,
} from "../../domains/content-types";

import { addSPContentTypeToListSchema, type AddSPContentTypeToListPayload } from "./schema";

import "@pnp/graph/sites";
import "@pnp/graph/lists";
import "@pnp/graph/content-types";

export class AddSPContentTypeToListAction extends ActionDefinition<
  "addSPContentTypeToList",
  typeof addSPContentTypeToListSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "addSPContentTypeToList";
  readonly actionSchema = addSPContentTypeToListSchema;
  readonly requiredClients = ["graphClient"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return graphContentTypePermissionCheck();
  }

  async handler(ctx: M365RuntimeContext<AddSPContentTypeToListPayload>): Promise<M365ActionResult> {
    const graphClient = ctx.clients.graphClient;
    if (!graphClient) throw new Error("GraphFI instance not available in scope");

    const payload = ctx.action.payload;
    const resource = getContentTypeReferenceResource(payload);
    try {
      const target = await resolveGraphListTarget(graphClient, ctx.scopeIn, payload);
      const siteContentType = await resolveSiteContentType(graphClient, target.graphSiteId, payload);
      if (!siteContentType) return actionSkipped(resource, "missing_prerequisite");

      const existing = await resolveListContentType(graphClient, target.graphSiteId, target.graphListId, payload);
      if (existing) {
        return actionSkipped(resource, "already_exists", {
          graphSiteId: target.graphSiteId,
          graphListId: target.graphListId,
        }, existing.warnings);
      }

      // When the action runs as a createSPList subaction, an SP list handle is available.
      // Enabling content types here prevents Graph addCopy from failing on lists created
      // without content types or on existing lists whose mutable setting differs.
      if (ctx.scopeIn.list) {
        await ctx.scopeIn.list.update({ ContentTypesEnabled: true });
      }

      const added = await graphClient.sites
        .getById(target.graphSiteId)
        .lists.getById(target.graphListId)
        .contentTypes
        .addCopy(siteContentType.handle);

      return actionExecuted(added.data.name ?? resource, {
        graphSiteId: target.graphSiteId,
        graphListId: target.graphListId,
      }, siteContentType.warnings);
    } catch (error) {
      const normalized = normalizeGraphContentTypeError(error, "addSPContentTypeToList");
      throw new Error(normalized.message);
    }
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, AddSPContentTypeToListPayload, M365Clients>
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
      return existing
        ? compliant({ resource, scopeDelta: { graphSiteId: target.graphSiteId, graphListId: target.graphListId } })
        : nonCompliant({ resource, reason: "not_found" });
    } catch (error) {
      const graphError = getGraphContentTypeComplianceReason(error, "addSPContentTypeToList compliance");
      if (graphError.reason !== "graph_error") {
        return unverifiable({ resource, reason: graphError.reason, message: graphError.message });
      }
      return unverifiableError(resource, error);
    }
  }
}
