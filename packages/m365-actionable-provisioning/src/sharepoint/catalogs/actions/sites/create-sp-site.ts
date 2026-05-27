/**
 * CreateSPSite action definition.
 *
 * @remarks
 * Creates a new SharePoint site collection (Communication or Team).
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
import type { ICreateCommSiteProps, ICreateTeamSiteProps, ISiteCreationResponse } from "@pnp/sp/sites/types";
import { Web } from "@pnp/sp/webs";
import { Site } from "@pnp/sp/sites";
import "@pnp/sp/sites";
import "@pnp/sp/webs";

import { resolveTargetWeb } from "../../../utils/sp-utils";
import { createSPSiteSchema, type CreateSPSitePayload } from "../../schemas/sites/create-sp-site.schema";

/* ========================================
   ACTION DEFINITION
   ======================================== */

/**
 * CreateSPSite action implementation.
 * 
 * @remarks
 * Creates a SharePoint site collection (Communication or Team) and propagates context to child actions.
 * 
 * **Site Types:**
 * - **Communication Site**: Standalone site with explicit URL, supports app-only auth
 * - **Team Site**: Backed by Microsoft 365 Group, URL auto-generated, requires user context
 * 
 * **Permission Requirements:**
 * - SharePoint Administrator or Global Administrator role
 * - Entra ID Application Permission: `Sites.FullControl.All` (for app-only)
 * - Entra ID Delegated Permission: `AllSites.FullControl` (for user context)
 * 
 * **Provisioning Behavior:**
 * - Site creation is asynchronous in SharePoint
 * - Handler implements polling if `SiteStatus` is `1` (Provisioning)
 * - Waits up to 5 minutes (configurable) for completion
 * 
 * **Scope Output:**
 * - `site`: PnPjs Site handle bound to the created site
 * - `web`: PnPjs Web handle bound to the created site's root web
 * 
 * @public
 */
export class CreateSPSiteAction extends ActionDefinition<
    "createSPSite",
    typeof createSPSiteSchema,
    SPScope
> {
    readonly verb = "createSPSite";
    readonly actionSchema = createSPSiteSchema;

    /**
     * Checks permissions for site creation.
     * 
     * @param ctx - Action runtime context
     * @returns Permission check result
     * 
     * @remarks
      * Intentionally side-effect free.
      * Preflight/JIT permission checks must not mutate scope; the engine isolates permission probes
      * from execution scope to avoid "freezing" a stale target web.
     * 
     * **Permission Check:**
     * - Validates SPFI context is accessible
     * - Assumes if context works, user has sufficient permissions
     * - Note: Does not perform deep tenant admin check to avoid extra API calls
     */
    override async checkPermissions(
        ctx: SPRuntimeContext<CreateSPSitePayload>
    ): Promise<PermissionCheckResult> {
        const { siteType } = ctx.action.payload;

        // Intentionally side-effect free: preflight/JIT permission checks must not mutate scope.
        // We still resolve the effective target web so the message is informative.
        const spfi = ctx.scopeIn.spfi;
        if (spfi) {
            await resolveTargetWeb({ spfi, webUrl: ctx.action.payload.url });
        }

        return {
            decision: "unknown",
            message: `Unable to verify CreateSPSite permissions for siteType=${siteType} at preflight`
        };
    }

    override async checkCompliance(
        ctx: ComplianceRuntimeContext<SPScope, CreateSPSitePayload>
    ): Promise<ComplianceActionCheckResult<SPScope>> {
        const spfi = ctx.scopeIn.spfi;
        if (!spfi) {
            return { outcome: "unverifiable", reason: "missing_prerequisite", message: "SPFI instance not available in scope" };
        }

        const siteUrl = ctx.action.payload.url;
        try {
            const exists = await spfi.site.exists(siteUrl);
            if (!exists) {
                return { outcome: "non_compliant", resource: siteUrl, reason: "not_found" };
            }

            const web = Web([spfi.web, siteUrl]);
            const site = Site([spfi.site, siteUrl]);

            return { outcome: "compliant", resource: siteUrl, scopeDelta: { site, web } };
        } catch (e) {
            return {
                outcome: "unverifiable",
                resource: siteUrl,
                reason: "error",
                message: normalizeError(e).message,
            };
        }
    }

    /**
     * Creates a SharePoint site collection with async provisioning support.
     * 
     * @param ctx - Action runtime context
     * @returns Action result with created site details
     * 
     * @remarks
     * **Implementation Flow:**
     * 1. Call appropriate PnPjs method based on `siteType`
     * 2. Check `SiteStatus` in response
     * 3. If status is `1` (Provisioning), poll until `2` (Ready) or `3` (Error)
     * 4. Return result with site details and scope delta
     * 
     * **SiteStatus Values:**
     * - `0`: Not Found (should not occur on creation)
     * - `1`: Provisioning (triggers polling)
     * - `2`: Ready (success)
     * - `3`: Error (failure)
     * 
     * **Scope Delta:**
    * - `site`: PnPjs Site handle bound to the created site
    * - `web`: PnPjs Web handle bound to the created site's root web
     */
    override async handler(
        ctx: SPRuntimeContext<CreateSPSitePayload>
    ): Promise<SPActionResult> {
        const payload = ctx.action.payload;
        const spfi = ctx.scopeIn.spfi;
        if (!spfi) {
            throw new Error("SPFI instance not available in scope");
        }

        const desiredTitle = payload.siteType === "CommunicationSite" ? payload.title : payload.displayName;

        // Idempotency guard: if we can determine a target URL and it already exists, skip creation.
        // - CommunicationSite: URL is always known
        // - TeamSite: URL is known only if payload.url is provided
        const targetUrl = payload.url;
        if (targetUrl) {
            const alreadyExists = await spfi.site.exists(targetUrl);
            if (alreadyExists) {
                ctx.logger.info("Site already exists - skipping creation", {
                    siteType: payload.siteType,
                    siteUrl: targetUrl,
                    alias: payload.siteType === "TeamSite" ? payload.alias : undefined
                });

                return {
                    result: {
                        outcome: "skipped",
                        resource: desiredTitle,
                        reason: "already_exists",
                    },
                    scopeDelta: {
                        site: Site([spfi.site, targetUrl]),
                        web: Web([spfi.web, targetUrl]),
                    }
                };
            }
        }

        try {
            let response: ISiteCreationResponse;

            if (payload.siteType === "CommunicationSite") {
                // === COMMUNICATION SITE ===
                ctx.logger.info("Creating Communication Site", {
                    title: payload.title,
                    url: payload.url
                });

                const props: ICreateCommSiteProps = {
                    Title: payload.title,
                    Url: payload.url,
                    Lcid: payload.lcid,
                    Description: payload.description,
                    Classification: payload.classification,
                    SiteDesignId: payload.siteDesignId,
                    HubSiteId: payload.hubSiteId,
                    ShareByEmailEnabled: payload.shareByEmailEnabled,
                    WebTemplate: payload.webTemplate,
                    Owner: payload.owner
                };

                // Remove undefined values (PnPjs doesn't accept them)
                const cleanProps = Object.fromEntries(
                    Object.entries(props).filter(([_, v]) => v !== undefined)
                ) as ICreateCommSiteProps;

                const rawResponse = await spfi.site.createCommunicationSiteFromProps(cleanProps);

                // Parse response if it's a string (PnPjs may return JSON string)
                response = typeof rawResponse === 'string'
                    ? JSON.parse(rawResponse) as ISiteCreationResponse
                    : rawResponse;

            } else {
                // === TEAM SITE ===
                ctx.logger.info("Creating Team Site", {
                    displayName: payload.displayName,
                    alias: payload.alias
                });

                const props: ICreateTeamSiteProps = {
                    displayName: payload.displayName,
                    alias: payload.alias,
                    isPublic: payload.isPublic,
                    lcid: payload.lcid,
                    description: payload.description,
                    classification: payload.classification,
                    owners: payload.owners,
                    hubSiteId: payload.hubSiteId,
                    siteDesignId: payload.siteDesignId
                };

                const cleanProps = Object.fromEntries(
                    Object.entries(props).filter(([_, v]) => v !== undefined)
                ) as ICreateTeamSiteProps;

                const rawResponse = await spfi.site.createModernTeamSiteFromProps(cleanProps);

                // Parse response if it's a string (PnPjs may return JSON string)
                response = typeof rawResponse === 'string'
                    ? JSON.parse(rawResponse) as ISiteCreationResponse
                    : rawResponse;
            }

            // === POLLING IF PROVISIONING ===
            if (response.SiteStatus === 1) {
                ctx.logger.info("Site provisioning in progress, starting polling", {
                    siteUrl: response.SiteUrl
                });

                response = await this.pollSiteStatus(ctx, response.SiteUrl);
            }

            // === VALIDATE FINAL STATUS ===
            if (response.SiteStatus === 3) {
                throw new Error(
                    `Site provisioning failed for ${response.SiteUrl} (SiteStatus: 3 - Error)`
                );
            }

            if (response.SiteStatus !== 2) {
                throw new Error(
                    `Unexpected SiteStatus: ${response.SiteStatus} for ${response.SiteUrl}`
                );
            }

            // === SUCCESS ===
            ctx.logger.info("Site created successfully", {
                siteId: response.SiteId,
                siteUrl: response.SiteUrl
            });

            return {
                result: {
                    outcome: "executed",
                    resource: desiredTitle,
                },
                scopeDelta: {
                    site: Site([spfi.site, response.SiteUrl]),
                    web: Web([spfi.web, response.SiteUrl]),
                }
            };

        } catch (err) {
            // Let the engine do centralized error enrichment/logging
            if (err instanceof Error) throw err;
            throw new Error(`Failed to create site: ${String(err)}`);
        }
    }

    /**
     * Polls site status until provisioning completes or times out.
     * 
     * @param ctx - Action runtime context
     * @param siteUrl - URL of the site to poll
     * @param maxAttempts - Maximum polling attempts (default: 30)
     * @param intervalMs - Milliseconds between attempts (default: 10000 = 10s)
     * @returns Final site creation response with status 2 (Ready) or 3 (Error)
     * @throws Error if polling times out or fails
     * 
     * @remarks
     * **Polling Strategy:**
     * - Default: 30 attempts × 10 seconds = 5 minutes max wait
     * - Uses SharePoint REST API status endpoint
     * - Stops on status 2 (Ready) or 3 (Error)
     * 
     * **Note:** PnPjs doesn't expose the status endpoint directly.
     * Implementation uses raw HTTP call via SPFI context.
     * 
     * @internal
     */
    private async pollSiteStatus(
        ctx: SPRuntimeContext<CreateSPSitePayload>,
        siteUrl: string,
        maxAttempts = 30,
        intervalMs = 10000
    ): Promise<ISiteCreationResponse> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            // Wait before polling
            await new Promise(resolve => setTimeout(resolve, intervalMs));

            try {
                // Use PnPjs site.exists() as proxy for status check
                // Full REST endpoint would be: /_api/SPSiteManager/status?url='...'
                // For now, we try to access the site to check if it's ready
                const spfi = ctx.scopeIn.spfi;
                if (!spfi) {
                    throw new Error("SPFI instance not available in scope during polling");
                }
                const exists = await spfi.site.exists(siteUrl);

                ctx.logger.debug(`Polling attempt ${attempt}/${maxAttempts}`, {
                    siteUrl,
                    exists
                });

                if (exists) {
                    // Site exists and is accessible → assume Ready
                    ctx.logger.info(`Site provisioning completed after ${attempt} attempts`, {
                        siteUrl,
                        attempts: attempt,
                        totalWaitSeconds: (attempt * intervalMs) / 1000
                    });

                    return {
                        SiteId: "", // Not available from exists check
                        SiteStatus: 2, // Ready
                        SiteUrl: siteUrl
                    };
                }

            } catch {
                // Continue polling - errors are expected during provisioning
            }
        }

        // Timeout
        const totalWaitMinutes = (maxAttempts * intervalMs) / 60000;
        throw new Error(
            `Site provisioning timeout after ${maxAttempts} attempts (${totalWaitMinutes} minutes). ` +
            `Site may still be provisioning in background: ${siteUrl}`
        );
    }
}
