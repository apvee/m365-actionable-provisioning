import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { compareProperties } from "../../_shared/compliance-compare";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";
import {
  buildContentTypeColumnPatch,
  getGraphContentTypeComplianceReason,
  getContentTypeColumn,
  graphContentTypePermissionCheck,
  normalizeGraphContentTypeError,
  resolveFieldReferenceFromScope,
  updateContentTypeColumnSettings,
} from "../../domains/content-types";

import { modifySPContentTypeFieldSchema, type ModifySPContentTypeFieldPayload } from "./schema";

export class ModifySPContentTypeFieldAction extends ActionDefinition<
  "modifySPContentTypeField",
  typeof modifySPContentTypeFieldSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "modifySPContentTypeField";
  readonly actionSchema = modifySPContentTypeFieldSchema;
  readonly requiredClients = ["graphClient"] as const;

  async checkPermissions(): Promise<PermissionCheckResult> {
    return graphContentTypePermissionCheck();
  }

  async handler(ctx: M365RuntimeContext<ModifySPContentTypeFieldPayload>): Promise<M365ActionResult> {
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

      const changed = await updateContentTypeColumnSettings(contentType, existing.id, payload);
      return changed ? actionExecuted(resource) : actionSkipped(resource, "no_changes");
    } catch (error) {
      const normalized = normalizeGraphContentTypeError(error, "modifySPContentTypeField");
      throw new Error(normalized.message);
    }
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, ModifySPContentTypeFieldPayload, M365Clients>
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
      const expected = buildContentTypeColumnPatch(payload) as Record<string, unknown>;
      if (Object.keys(expected).length === 0) return compliant({ resource, reason: "no_changes" });
      const mismatches = compareProperties(expected, existing as Record<string, unknown>, { nullishEqual: true });
      if (mismatches.length > 0) {
        return nonCompliant({ resource, reason: "mismatch", details: { mismatches } });
      }
      return compliant({ resource });
    } catch (error) {
      const graphError = getGraphContentTypeComplianceReason(error, "modifySPContentTypeField compliance");
      if (graphError.reason !== "graph_error") {
        return unverifiable({ resource, reason: graphError.reason, message: graphError.message });
      }
      return unverifiableError(resource, error);
    }
  }
}
