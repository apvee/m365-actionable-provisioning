/**
 * SharePoint utility functions for provisioning engine.
 * 
 * @remarks
 * Provides helper functions for retrieving SharePoint lists by various identifiers.
 * 
 * @internal
 * @packageDocumentation
 */

import type { IWeb } from "@pnp/sp/webs";
import type { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import { Web } from "@pnp/sp/webs";

/**
 * Resolves the target Web for actions that operate within a web context.
 *
 * @remarks
 * Resolution order (authoritative):
 * 1) explicit `webUrl`
 * 2) explicit `siteUrl` (root web of that site collection)
 * 3) `scopeWeb` (typically provided by parent actions via scopeDelta)
 * 4) default: root web of the current site collection behind the SPFI context
 *
 * This function is intentionally side-effect free: it does not mutate the scope.
 */
export async function resolveTargetWeb(opts: {
  spfi: SPFI;
  scopeWeb?: IWeb;
  webUrl?: string;
  siteUrl?: string;
}): Promise<{ web: IWeb; effectiveWebUrl: string }> {
  const { spfi, scopeWeb, webUrl, siteUrl } = opts;

  if (webUrl) {
    return { web: Web([spfi.web, webUrl]), effectiveWebUrl: webUrl };
  }

  if (siteUrl) {
    return { web: Web([spfi.web, siteUrl]), effectiveWebUrl: siteUrl };
  }

  if (scopeWeb) {
    // We don't know the absolute URL without a network call; keep a stable label.
    return { web: scopeWeb, effectiveWebUrl: "(scope)" };
  }

  const currentSiteUrl = (await spfi.site.select("Url")<{ Url: string }>()).Url;
  return { web: Web([spfi.web, currentSiteUrl]), effectiveWebUrl: currentSiteUrl };
}
