import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import {
  getContentTypeColumn,
  getGraphContentTypeComplianceReason,
  graphContentTypePermissionCheck,
  normalizeGraphContentTypeError,
  resolveFieldReferenceFromScope,
} from "../../domains/content-types";

import { removeSPFieldFromContentTypeSchema, type RemoveSPFieldFromContentTypePayload } from "./schema";

export class RemoveSPFieldFromContentTypeAction extends ActionDefinition<
  "removeSPFieldFromContentType",
  typeof removeSPFieldFromContentTypeSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "removeSPFieldFromContentType";
  readonly actionSchema = removeSPFieldFromContentTypeSchema;
  readonly requiredClients = ["graphClient"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return graphContentTypePermissionCheck();
  }

  async handler(ctx: M365RuntimeContext<RemoveSPFieldFromContentTypePayload>): Promise<M365ActionResult> {
    const payload = ctx.action.payload;
    const resource = payload.fieldName ?? payload.fieldId ?? "(field)";
    const contentType = ctx.scopeIn.contentType;
    if (!contentType) {
      return actionSkipped(resource, "missing_prerequisite");
    }

    try {
      const fieldReference = resolveFieldReferenceFromScope(ctx.scopeIn, payload);
      const existing = await getContentTypeColumn(contentType, fieldReference);
      if (!existing?.id) {
        return actionSkipped(resource, "not_found");
      }

      await contentType.columns.getById(existing.id).delete();
      return actionExecuted(resource);
    } catch (error) {
      const normalized = normalizeGraphContentTypeError(error, "removeSPFieldFromContentType");
      throw new Error(normalized.message);
    }
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, RemoveSPFieldFromContentTypePayload, M365Clients>
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
      return existing ? nonCompliant({ resource, reason: "still_present" }) : compliant({ resource });
    } catch (error) {
      const graphError = getGraphContentTypeComplianceReason(error, "removeSPFieldFromContentType compliance");
      if (graphError.reason !== "graph_error") {
        return unverifiable({ resource, reason: graphError.reason, message: graphError.message });
      }
      return unverifiableError(resource, error);
    }
  }
}
