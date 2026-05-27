/**
 * ModifySPList action definition.
 * 
 * @remarks
 * Modifies an existing SharePoint list.
 * 
 * **Dual-mode action:**
 * - Root-level: Provide `webUrl` in payload (optional)
 * - Subaction: Uses parent-provided `web` handle from scope
 * 
 * Allows field subactions.
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
import { modifySPListSchema, type ModifySPListPayload } from "../../schemas/lists/modify-sp-list.schema";
import { buildModifyListUpdateProps } from "./list-update.helpers";
import { compareProperties } from "../shared/compliance-compare";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * ModifySPList action implementation.
 * 
 * @remarks
 * Modifies a SharePoint list using optimized retrieval pattern.
 * 
 * **Permission Requirements:**
 * - Manage Lists permission on the web
 * 
 * **Scope Output:** None (or updated listName if title changed)
 * - `web`: PnPjs Web handle bound to the target web
 * - `list`: PnPjs List handle bound to the updated list
 * 
 * @public
 */
export class ModifySPListAction extends ActionDefinition<
  "modifySPList",
  typeof modifySPListSchema,
  SPScope
> {
  readonly verb = "modifySPList";
  readonly actionSchema = modifySPListSchema;

  /**
   * Checks permissions for list modification.
   * 
   * @param ctx - Action runtime context
   * @returns Permission check result
   * 
   * @remarks
   * Resolves the target web URL (payload → scope → SPFI site URL) and runs a best-effort
   * permission probe for `ManageLists`.
   */
  override async checkPermissions(
    ctx: SPRuntimeContext<ModifySPListPayload>
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
   * Modifies a SharePoint list.
   * 
   * @param ctx - Action runtime context
   * @returns Action result with modified list details
   * 
   * @remarks
   * Idempotent behavior:
   * - If the list doesn't exist, the action returns a "skipped" result (no throw).
   * - If it exists, it updates the provided properties via `list.update()`.
   */
  override async handler(
    ctx: SPRuntimeContext<ModifySPListPayload>
  ): Promise<SPActionResult> {
    const scopeIn = ctx.scopeIn;
    const spfi = scopeIn.spfi;
    if (!spfi) {
      throw new Error("SPFI instance not available in scope");
    }

    const { web, effectiveWebUrl } = await resolveTargetWeb({
      spfi,
      scopeWeb: scopeIn.web,
      webUrl: ctx.action.payload.webUrl,
    });

    const resolvedWebUrl = await resolveWebUrlString(web, effectiveWebUrl);
    const listName = ctx.action.payload.listName;

    const found = await getListInfoByRootFolderName(web, listName);
    if (!found?.Id) {
      ctx.logger.info("List not found; skipping modify", { webUrl: resolvedWebUrl, listName });
      return {
        result: {
          outcome: "skipped",
          resource: listName,
          reason: "not_found",
        },
      };
    }

    const { updateProps } = buildModifyListUpdateProps(ctx.action.payload);

    const list = web.lists.getById(found.Id);
    const updatedProperties = Object.keys(updateProps);
    if (updatedProperties.length === 0) {
      ctx.logger.info("No list changes requested; skipping modify", {
        webUrl: resolvedWebUrl,
        listName,
        listId: found.Id,
      });

      return {
        result: {
          outcome: "skipped",
          resource: listName,
          reason: "no_changes",
        },
        scopeDelta: {
          web,
          list,
        },
      };
    }

    await list.update(updateProps);

    ctx.logger.info("List modified", {
      webUrl: resolvedWebUrl,
      listName,
      listId: found.Id,
      updatedProperties,
    });

    return {
      result: {
        outcome: "executed",
        resource: listName,
      },
      scopeDelta: {
        web,
        list,
      },
    };
  }

  override async checkCompliance(
    ctx: ComplianceRuntimeContext<SPScope, ModifySPListPayload>
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
    let found: { Id: string } | undefined;
    try {
      found = await getListInfoByRootFolderName(web, listName);
    } catch (e) {
      return {
        outcome: "unverifiable",
        resource: listName,
        reason: "error",
        message: normalizeError(e).message,
      };
    }

    if (!found?.Id) {
      return { outcome: "non_compliant", resource: listName, reason: "not_found" };
    }

    const list = web.lists.getById(found.Id);
    const { expected, selectKeys } = buildModifyListUpdateProps(ctx.action.payload);
    if (selectKeys.length === 0) {
      return { outcome: "compliant", resource: listName, reason: "no_changes", scopeDelta: { web, list } };
    }

    try {
      const actual = (await (list as typeof list & { select: (...k: string[]) => () => Promise<Record<string, unknown>> }).select(
        ...selectKeys
      )()) as Record<string, unknown>;

      const mismatches = compareProperties(expected, actual, { nullishEqual: true });

      if (mismatches.length > 0) {
        return { outcome: "non_compliant", resource: listName, reason: "mismatch", details: { mismatches } };
      }

      return { outcome: "compliant", resource: listName, scopeDelta: { web, list } };
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
