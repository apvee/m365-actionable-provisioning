import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight, ProvisioningWarning } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import {
  getGraphContentTypeComplianceReason,
  getContentTypeColumn,
  graphContentTypePermissionCheck,
  normalizeGraphContentTypeError,
  resolveFieldReferenceFromScope,
  resolveSiteColumn,
  updateContentTypeColumnSettings,
} from "../../domains/content-types";

import { addSPFieldToContentTypeSchema, type AddSPFieldToContentTypePayload } from "./schema";

export class AddSPFieldToContentTypeAction extends ActionDefinition<
  "addSPFieldToContentType",
  typeof addSPFieldToContentTypeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "addSPFieldToContentType";
  readonly actionSchema = addSPFieldToContentTypeSchema;
  readonly requiredClients = ["graphClient"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return graphContentTypePermissionCheck();
  }

  async handler(ctx: M365RuntimeContext<AddSPFieldToContentTypePayload>): Promise<M365ActionResult> {
    const graphClient = ctx.clients.graphClient;
    if (!graphClient) throw new Error("GraphFI instance not available in scope");

    const payload = ctx.action.payload;
    const resource = payload.fieldName ?? payload.fieldId ?? "(field)";
    const graphSiteId = typeof ctx.scopeIn.graphSiteId === "string" ? ctx.scopeIn.graphSiteId : undefined;
    const contentType = ctx.scopeIn.contentType;
    if (!graphSiteId || !contentType) {
      return actionSkipped(resource, "missing_prerequisite");
    }

    try {
      const fieldReference = resolveFieldReferenceFromScope(ctx.scopeIn, payload);
      const existing = await getContentTypeColumn(contentType, fieldReference);
      if (existing) {
        return actionSkipped(resource, "already_exists");
      }

      const siteColumn = await resolveSiteColumn(graphClient, graphSiteId, fieldReference);
      const added = await contentType.columns.addRef(siteColumn.handle);
      const warnings: ProvisioningWarning[] = [];
      if (added.id) {
        try {
          await updateContentTypeColumnSettings(contentType, added.id, payload);
        } catch (error) {
          const normalized = normalizeGraphContentTypeError(error, "addSPFieldToContentType column settings update");
          warnings.push({
            code: normalized.code,
            message: `Field was added to the content type, but column settings could not be applied. ${normalized.message}`,
            details: {
              fieldId: added.id,
              ...(normalized.status !== undefined ? { status: normalized.status } : {}),
            },
          });
        }
      }

      return actionExecuted(resource, undefined, warnings);
    } catch (error) {
      const normalized = normalizeGraphContentTypeError(error, "addSPFieldToContentType");
      throw new Error(normalized.message);
    }
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, AddSPFieldToContentTypePayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const payload = ctx.action.payload;
    const resource = payload.fieldName ?? payload.fieldId ?? "(field)";
    const contentType = ctx.scopeIn.contentType;
    if (!contentType) {
      return unverifiable({ resource, reason: "missing_prerequisite", message: "Content type scope is not available" });
    }

    try {
      const fieldReference = resolveFieldReferenceFromScope(ctx.scopeIn, payload);
      const existing = await getContentTypeColumn(contentType, fieldReference);
      if (!existing) return nonCompliant({ resource, reason: "not_found" });
      return compliant({ resource });
    } catch (error) {
      const graphError = getGraphContentTypeComplianceReason(error, "addSPFieldToContentType compliance");
      if (graphError.reason !== "graph_error") {
        return unverifiable({ resource, reason: graphError.reason, message: graphError.message });
      }
      return unverifiableError(resource, error);
    }
  }
}
