/**
 * DeleteSPList action definition.
 * 
 * @remarks
 * Deletes a SharePoint list.
 * 
 * **Dual-mode action:**
 * - Root-level: Provide `webUrl` in payload (optional)
 * - Subaction: Uses parent-provided `web` handle from scope
 * 
 * No subactions allowed (leaf action).
 *
 * The Zod schema for this action is co-located in `schema.ts`.
 * 
 * @packageDocumentation
 */

import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../../core/action";
import type { PermissionCheckResult } from "../../../../../core/permissions";
import type { M365Clients, ProvisioningResultLight, M365Scope, M365RuntimeContext, M365ActionResult } from "../../../../../m365";
import { actionExecuted, actionSkipped, compliant, nonCompliant, unverifiable, unverifiableError } from "../../_shared/action-results";

import "@pnp/sp/lists";
import "@pnp/sp/security/web";

import { resolveTargetWeb } from "../../../../utils/sp-utils";

import { getListInfoByRootFolderName, probeManageListsPermission, resolveWebUrlString } from "../../../../shared/domains/lists";

import { deleteSPListSchema, type DeleteSPListPayload } from "./schema";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * DeleteSPList action implementation.
 * 
 * @remarks
 * Deletes a SharePoint list using optimized retrieval pattern.
 * 
 * **Permission Requirements:**
 * - Manage Lists permission with Delete rights on the web
 * 
 * **Scope Output:** None (destructive operation)
 * 
 * @public
 */
export class DeleteSPListAction extends ActionDefinition<
  "deleteSPList",
  typeof deleteSPListSchema,
  M365Scope,
  ProvisioningResultLight,
  M365Clients
> {
  readonly verb = "deleteSPList";
  readonly actionSchema = deleteSPListSchema;
  readonly requiredClients = ["spfi"] as const;

  /**
   * Checks permissions for list deletion.
   * 
   * @param ctx - Action runtime context
   * @returns Permission check result
   * 
   * @remarks
   * Resolves the target web URL (payload → scope → SPFI site URL) and runs a best-effort
   * permission probe for `ManageLists`.
   */
  async checkPermissions(
    ctx: M365RuntimeContext<DeleteSPListPayload>
  ): Promise<PermissionCheckResult> {
    const scopeIn = ctx.scopeIn;
    const spfi = ctx.clients.spfi;
    if (!spfi) {
      return { decision: "deny", message: "SPFI instance not available in scope" };
    }

    const { web, effectiveWebUrl } = await resolveTargetWeb({
      spfi,
      scopeWeb: scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
    });

    return probeManageListsPermission(web, effectiveWebUrl);
  }

  /**
   * Deletes a SharePoint list.
   * 
   * @param ctx - Action runtime context
   * @returns Action result with deletion confirmation
   * 
   * @remarks
   * Idempotent behavior:
   * - If the list doesn't exist, the action returns a "skipped" result (no throw).
   * - If it exists, it is recycled by default.
   */
  async handler(
    ctx: M365RuntimeContext<DeleteSPListPayload>
  ): Promise<M365ActionResult> {
    const scopeIn = ctx.scopeIn;
    const spfi = ctx.clients.spfi;
    if (!spfi) {
      throw new Error("SPFI instance not available in scope");
    }

    const { listName, recycle } = ctx.action.payload;

    const { web, effectiveWebUrl } = await resolveTargetWeb({
      spfi,
      scopeWeb: scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
    });

    const resolvedWebUrl = await resolveWebUrlString(web, effectiveWebUrl);
    const found = await getListInfoByRootFolderName(web, listName);
    if (!found?.Id) {
      ctx.logger.info("List not found; skipping delete", { webUrl: resolvedWebUrl, listName });
      return actionSkipped(listName, "not_found");
    }

    const list = web.lists.getById(found.Id);

    if (recycle) {
      const recycleBinItemId = await list.recycle();
      ctx.logger.info("List recycled", { webUrl: resolvedWebUrl, listName, listId: found.Id, recycleBinItemId });
      return actionExecuted(listName);
    }

    await list.delete();
    ctx.logger.info("List deleted", { webUrl: resolvedWebUrl, listName, listId: found.Id });
    return actionExecuted(listName);
  }

  async checkCompliance(
    ctx: ComplianceRuntimeContext<M365Scope, DeleteSPListPayload, M365Clients>
  ): Promise<ComplianceActionCheckResult<M365Scope>> {
    const spfi = ctx.clients.spfi;
    if (!spfi) {
      return unverifiable({
        reason: "missing_prerequisite",
        message: "SPFI instance not available in scope",
      });
    }

    const { web } = await resolveTargetWeb({
      spfi,
      scopeWeb: ctx.scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
    });

    const listName = ctx.action.payload.listName;
    try {
      const found = await getListInfoByRootFolderName(web, listName);
      if (!found?.Id) {
        return compliant({ resource: listName });
      }
      return nonCompliant({ resource: listName, reason: "still_exists" });
    } catch (e) {
      return unverifiableError(listName, e);
    }
  }
}
