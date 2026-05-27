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
 * The Zod schema for this action is defined in `catalogs/schemas/lists`.
 * 
 * @packageDocumentation
 */

import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import { normalizeError } from "../../../../core";
import type { SPScope, SPRuntimeContext, SPActionResult } from "../../../types";

import "@pnp/sp/lists";
import "@pnp/sp/security/web";

import { resolveTargetWeb } from "../../../utils/sp-utils";

import { getListInfoByRootFolderName, probeManageListsPermission, resolveWebUrlString } from "./base.helpers";

import { deleteSPListSchema, type DeleteSPListPayload } from "../../schemas/lists/delete-sp-list.schema";

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
  SPScope
> {
  readonly verb = "deleteSPList";
  readonly actionSchema = deleteSPListSchema;

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
  override async checkPermissions(
    ctx: SPRuntimeContext<DeleteSPListPayload>
  ): Promise<PermissionCheckResult> {
    const scopeIn = ctx.scopeIn;
    const spfi = scopeIn.spfi;
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
  override async handler(
    ctx: SPRuntimeContext<DeleteSPListPayload>
  ): Promise<SPActionResult> {
    const scopeIn = ctx.scopeIn;
    const spfi = scopeIn.spfi;
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
      return {
        result: {
          outcome: "skipped",
          resource: listName,
          reason: "not_found",
        },
      };
    }

    const list = web.lists.getById(found.Id);

    if (recycle) {
      const recycleBinItemId = await list.recycle();
      ctx.logger.info("List recycled", { webUrl: resolvedWebUrl, listName, listId: found.Id, recycleBinItemId });
      return {
        result: {
          outcome: "executed",
          resource: listName,
        },
      };
    }

    await list.delete();
    ctx.logger.info("List deleted", { webUrl: resolvedWebUrl, listName, listId: found.Id });
    return {
      result: {
        outcome: "executed",
        resource: listName,
      },
    };
  }

  override async checkCompliance(
    ctx: ComplianceRuntimeContext<SPScope, DeleteSPListPayload>
  ): Promise<ComplianceActionCheckResult<SPScope>> {
    const spfi = ctx.scopeIn.spfi;
    if (!spfi) {
      return { outcome: "unverifiable", reason: "missing_prerequisite", message: "SPFI instance not available in scope" };
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
        return { outcome: "compliant", resource: listName };
      }
      return { outcome: "non_compliant", resource: listName, reason: "still_exists" };
    } catch (e) {
      return {
        outcome: "unverifiable",
        resource: listName,
        reason: "error",
        message: normalizeError(e).message,
      };
    }
  }
}
