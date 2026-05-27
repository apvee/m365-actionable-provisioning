/**
 * ModifySPSite action definition.
 *
 * @remarks
 * Modifies an existing SharePoint site collection.
 *
 * Root-level action that can contain subactions.
 * Propagates PnPjs site/web handles to child actions via scope.
 *
 * The Zod schema for this action is defined in `catalogs/schemas/sites`.
 *
 * @packageDocumentation
 */

import { ActionDefinition, type ComplianceActionCheckResult, type ComplianceRuntimeContext } from "../../../../core/action";
import type { PermissionCheckResult } from "../../../../core/permissions";
import { normalizeError } from "../../../../core";
import type { SPScope, SPRuntimeContext, SPActionResult } from "../../../types";
import { pickDefined } from "../../../utils/object-utils";
import "@pnp/sp/webs";
import { Site } from "@pnp/sp/sites";
import { PermissionKind } from "@pnp/sp/security";
import "@pnp/sp/security/web";

import { resolveTargetWeb } from "../../../utils/sp-utils";
import { modifySPSiteSchema, type ModifySPSitePayload } from "../../schemas/sites/modify-sp-site.schema";
import { compareProperties } from "../shared/compliance-compare";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * ModifySPSite action implementation.
 * 
 * @remarks
 * Modifies a SharePoint site collection and propagates context to child actions.
 * 
 * **Permission Requirements:**
 * - Site Collection Administrator role
 * - Manage Web permissions
 * 
 * **Scope Output:**
 * - `site`: PnPjs Site handle bound to the target site
 * - `web`: PnPjs Web handle bound to the target root web
 * 
 * @public
 */
export class ModifySPSiteAction extends ActionDefinition<
    "modifySPSite",
    typeof modifySPSiteSchema,
    SPScope
> {
    readonly verb = "modifySPSite";
    readonly actionSchema = modifySPSiteSchema;

    /**
     * Checks permissions for site modification.
     * 
     * @param ctx - Action runtime context
     * @returns Permission check result
     * 
     * @remarks
     * Verifies the user has ManageWeb permission on the target site.
     * Note: permission checks are intentionally side-effect free (no scope mutation).
     */
    override async checkPermissions(
        ctx: SPRuntimeContext<ModifySPSitePayload>
    ): Promise<PermissionCheckResult> {
        const scopeIn = ctx.scopeIn;
        const spfi = scopeIn.spfi;
        if (!spfi) {
            return {
                decision: "deny",
                message: "SPFI instance not available in scope"
            };
        }

        const siteUrl = ctx.action.payload.siteUrl;
        const { web: rootWeb, effectiveWebUrl } = await resolveTargetWeb({
            spfi,
            scopeWeb: scopeIn.web,
            siteUrl,
        });

        // Best-effort permission probe.
        // If it returns false, we can confidently deny.
        // If it throws, return unknown (covers app-only or environments where currentUser semantics differ).
        try {
            const canManageWeb = await rootWeb.currentUserHasPermissions(PermissionKind.ManageWeb);
            if (!canManageWeb) {
                return {
                    decision: "deny",
                    message: `Access denied: current user lacks Manage Web on target site. target=${effectiveWebUrl}`
                };
            }

            return {
                decision: "allow",
                message: `Permission probe passed (ManageWeb). target=${effectiveWebUrl}`
            };
        } catch (e) {
            return {
                decision: "unknown",
                message: `Permission probe could not be completed. target=${effectiveWebUrl}. error=${String(e)}`
            };
        }
    }

    /**
     * Modifies a SharePoint site collection.
     * 
     * @param ctx - Action runtime context
     * @returns Action result with modified site details and scope delta
     * 
     * @remarks
     * Updates site/web properties (title, description) and propagates
     * PnPjs Site/Web handles to child actions via scopeDelta.
     */
    override async handler(
        ctx: SPRuntimeContext<ModifySPSitePayload>
    ): Promise<SPActionResult> {
        const { siteUrl: payloadSiteUrl } = ctx.action.payload;

        const spfi = ctx.scopeIn.spfi;
        if (!spfi) {
            throw new Error("SPFI instance not available in scope");
        }
        const { web: rootWeb, effectiveWebUrl } = await resolveTargetWeb({
            spfi,
            scopeWeb: ctx.scopeIn.web,
            siteUrl: payloadSiteUrl,
        });

        const siteUrl =
            payloadSiteUrl ??
            (effectiveWebUrl !== "(scope)"
                ? effectiveWebUrl
                : (await rootWeb.select("Url")<{ Url: string }>()).Url);

        // Validate target exists only when we can address it by URL.
        // If the target comes from an inherited scope web, the select("Url") call above already
        // ensures the web is reachable.
        if (payloadSiteUrl) {
            const exists = await spfi.site.exists(siteUrl);
            if (!exists) {
                throw new Error(`Cannot modify site because it does not exist. siteUrl=${siteUrl}`);
            }
        }

        const applied: string[] = [];

        const webProps = pickDefined({
            Title: ctx.action.payload.title,
            Description: ctx.action.payload.description,
        });

        if (Object.keys(webProps).length > 0) {
            await rootWeb.update(webProps);
            applied.push("web.update");
        }

        const resource = ctx.action.payload.title ?? siteUrl;

        if (applied.length === 0) {
            ctx.logger.info("No site changes requested; skipping modify", { siteUrl });
            return {
                result: {
                    outcome: "skipped",
                    resource,
                    reason: "no_changes",
                },
                scopeDelta: {
                    site: Site([spfi.site, siteUrl]),
                    web: rootWeb,
                },
            };
        }

        ctx.logger.info("Site modification completed", { siteUrl, applied });

        return {
            result: {
                outcome: "executed",
                resource,
            },
            scopeDelta: {
                site: Site([spfi.site, siteUrl]),
                web: rootWeb,
            },
        };
    }

    override async checkCompliance(
        ctx: ComplianceRuntimeContext<SPScope, ModifySPSitePayload>
    ): Promise<ComplianceActionCheckResult<SPScope>> {
        const spfi = ctx.scopeIn.spfi;
        if (!spfi) {
            return { outcome: "unverifiable", reason: "missing_prerequisite", message: "SPFI instance not available in scope" };
        }

        const { siteUrl: payloadSiteUrl } = ctx.action.payload;
        const { web: rootWeb, effectiveWebUrl } = await resolveTargetWeb({
            spfi,
            scopeWeb: ctx.scopeIn.web,
            siteUrl: payloadSiteUrl,
        });

        const siteUrl =
            payloadSiteUrl ??
            (effectiveWebUrl !== "(scope)"
                ? effectiveWebUrl
                : (await rootWeb.select("Url")<{ Url: string }>()).Url);

        try {
            if (payloadSiteUrl) {
                const exists = await spfi.site.exists(siteUrl);
                if (!exists) {
                    return { outcome: "non_compliant", resource: siteUrl, reason: "not_found" };
                }
            }

            const expected = pickDefined({
                Title: ctx.action.payload.title,
                Description: ctx.action.payload.description,
            }) as Record<string, unknown>;

            const site = Site([spfi.site, siteUrl]);

            const selectKeys = Object.keys(expected);
            if (selectKeys.length === 0) {
                return { outcome: "compliant", resource: siteUrl, reason: "no_changes", scopeDelta: { site, web: rootWeb } };
            }

            const actual = (await (rootWeb as typeof rootWeb & {
                select: (...k: string[]) => () => Promise<Record<string, unknown>>;
            }).select(...selectKeys)()) as Record<string, unknown>;

            const mismatches = compareProperties(expected, actual, { nullishEqual: true });

            if (mismatches.length > 0) {
                return { outcome: "non_compliant", resource: siteUrl, reason: "mismatch", details: { mismatches } };
            }

            return { outcome: "compliant", resource: siteUrl, scopeDelta: { site, web: rootWeb } };
        } catch (e) {
            return {
                outcome: "unverifiable",
                resource: siteUrl,
                reason: "error",
                message: normalizeError(e).message,
            };
        }
    }
}
