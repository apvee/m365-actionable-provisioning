import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import type { M365ActionResult, M365Clients, M365RuntimeContext, M365Scope, ProvisioningResultLight } from "../../../../runtime";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiableError } from "../../_shared/action-results";
import {
  buildListViewUpdateProps,
  getListViewFieldResolutionDriftDetails,
  getPublicListViewInfoByTitle,
  getListViewStateMismatches,
  replaceViewFieldsWithInternalNames,
  resolveViewFieldInternalNames,
} from "../../domains/views";

import {
  buildListViewScopeDelta,
  checkListViewManageListsPermission,
  getListViewCompliancePrerequisites,
} from "../_shared/scope";
import { createSPListViewSchema, type CreateSPListViewPayload } from "./schema";

import "@pnp/sp/views";

export class CreateSPListViewAction extends ActionDefinition<
  "createSPListView",
  typeof createSPListViewSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "createSPListView";
  readonly actionSchema = createSPListViewSchema;
  readonly requiredClients = ["spfi"] as const;

  async checkPermissions(ctx: M365RuntimeContext<CreateSPListViewPayload>): Promise<PermissionCheckResult> {
    return checkListViewManageListsPermission(ctx);
  }

  async handler(ctx: M365RuntimeContext<CreateSPListViewPayload>): Promise<M365ActionResult> {
    const list = ctx.scopeIn.list;
    const payload = ctx.action.payload;
    if (!list) return actionSkipped(payload.title, "missing_prerequisite");

    const existing = await getPublicListViewInfoByTitle(list, payload.title);
    if (existing) return actionSkipped(payload.title, "already_exists", buildListViewScopeDelta(ctx.scopeIn));

    const requestedInternalNames = payload.fields !== undefined
      ? await resolveViewFieldInternalNames(list, payload.fields)
      : undefined;

    const created = await list.views.add(payload.title, false, {});
    const view = list.views.getById(created.Id);

    if (requestedInternalNames !== undefined) {
      await replaceViewFieldsWithInternalNames(view, requestedInternalNames);
    }

    const updateProps = buildListViewUpdateProps(payload);
    if (Object.keys(updateProps).length > 0) {
      await view.update(updateProps);
    }

    return actionExecuted(payload.title, buildListViewScopeDelta(ctx.scopeIn));
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, CreateSPListViewPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const resource = ctx.action.payload.title;
    const prerequisites = getListViewCompliancePrerequisites(ctx, resource);
    if (prerequisites.ok === false) return prerequisites.result;
    const { list } = prerequisites;

    try {
      const info = await getPublicListViewInfoByTitle(list, resource);
      if (!info) return nonCompliant({ resource, reason: "not_found" });

      const view = ctx.action.payload.fields !== undefined ? list.views.getById(info.Id) : undefined;
      const mismatches = await getListViewStateMismatches(list, view, ctx.action.payload, info);

      return mismatches.length === 0
        ? compliant({
          resource,
          scopeDelta: buildListViewScopeDelta(ctx.scopeIn),
        })
        : nonCompliant({ resource, reason: "drift", details: { mismatches } });
    } catch (error) {
      const fieldResolutionDetails = getListViewFieldResolutionDriftDetails(error);
      if (fieldResolutionDetails) return nonCompliant({ resource, reason: "drift", details: fieldResolutionDetails });
      return unverifiableError(resource, error);
    }
  }
}
